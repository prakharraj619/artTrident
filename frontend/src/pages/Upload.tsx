import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Brush, UploadCloud, ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Upload() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        medium: '',
        description: '',
        price: '',
        isForSale: false,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Redirect collectors/viewers who shouldn't be here
    if (user && user.role !== 'ARTIST') {
        navigate('/');
        return null;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imageFile) {
            setError('Please select an image to upload.');
            return;
        }

        if (!formData.title || !formData.medium) {
            setError('Title and medium are required.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // First create a Blob with the JSON artwork data
            const artworkData = {
                title: formData.title,
                medium: formData.medium,
                description: formData.description,
                price: formData.price ? parseFloat(formData.price) : Number(0),
                isForSale: formData.isForSale,
                imageUrl: '' // Backend will inject Cloudinary URL
            };

            const data = new FormData();

            // In Spring Boot, when a @RequestPart is an object, sending it as a JSON Blob is standard.
            data.append('artwork', new Blob([JSON.stringify(artworkData)], {
                type: 'application/json'
            }));

            // Append the actual binary image file
            data.append('image', imageFile);

            console.log('Sending upload request to /api/v1/artworks');

            const response = await apiClient.post('/artworks', data);

            console.log('Upload successful:', response.data);
            navigate('/');
        } catch (err: any) {
            console.error('Upload error:', err);
            console.error('Response data:', err.response?.data);
            setError(err.response?.data?.message || err.message || 'Failed to upload artwork. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-accent-blue/20 py-10 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Feed</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <Brush className="text-accent-blue" />
                        <span className="font-bold text-xl tracking-tight">artTrident Studio</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="glass-panel rounded-2xl p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <h1 className="text-3xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 tracking-tight">Upload Artwork</h1>
                    <p className="text-neutral-500 mb-8 font-light">Share your latest masterpiece with the world.</p>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Left Column: Image Upload */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-neutral-700">Artwork Image</label>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    relative flex flex-col items-center justify-center w-full h-96 
                                    border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
                                    ${previewUrl
                                        ? 'border-neutral-200 bg-white overflow-hidden group shadow-sm'
                                        : 'border-neutral-300 bg-white hover:border-accent-blue/70 hover:bg-accent-blue/5 hover-glow'}
                                `}
                            >
                                {previewUrl ? (
                                    <>
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="absolute inset-0 w-full h-full object-contain"
                                        />
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                            <ImageIcon size={32} className="text-neutral-900 mb-2" />
                                            <span className="text-neutral-900 font-bold">Click to change image</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="p-4 bg-neutral-100 rounded-full mb-4 group-hover:bg-neutral-200 transition-colors">
                                            <UploadCloud className="w-8 h-8 text-neutral-500 group-hover:text-accent-blue transition-colors" />
                                        </div>
                                        <p className="mb-2 text-sm text-neutral-600">
                                            <span className="font-semibold text-accent-blue">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-neutral-400">PNG, JPG, WEBP up to 10MB</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/jpeg, image/png, image/webp"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        {/* Right Column: Form Data */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors shadow-sm"
                                    placeholder="e.g. Starry Night"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Medium *</label>
                                <input
                                    type="text"
                                    name="medium"
                                    required
                                    value={formData.medium}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors shadow-sm"
                                    placeholder="e.g. Oil on Canvas, Digital"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors resize-none shadow-sm"
                                    placeholder="Tell the story behind your creation..."
                                />
                            </div>

                            <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm transition-all duration-300">
                                <label className="flex items-center gap-3 cursor-pointer mb-4">
                                    <input
                                        type="checkbox"
                                        name="isForSale"
                                        checked={formData.isForSale}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-neutral-300 text-accent-blue focus:ring-accent-blue focus:ring-offset-white bg-white cursor-pointer"
                                    />
                                    <span className="text-neutral-700 font-bold">Offer this artwork for sale</span>
                                </label>

                                {formData.isForSale && (
                                    <div className="pl-8 animate-fade-in">
                                        <label className="block text-sm font-bold text-neutral-600 mb-2">Price ($)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                                            <input
                                                type="number"
                                                name="price"
                                                min="0.01"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={handleChange}
                                                required={formData.isForSale}
                                                className="w-full bg-white border border-neutral-200 rounded-lg pl-8 pr-4 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors shadow-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-blue to-accent-teal text-white font-bold py-4 px-8 rounded-xl hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-blue/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-8"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Publishing...</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={20} />
                                        <span>Publish Artwork</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
