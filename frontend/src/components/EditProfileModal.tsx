import { useState, useRef } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import apiClient from '../api/client';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    currentBio: string;
    currentPictureUrl: string;
    onSuccess: (updatedData: { name: string; bio: string; profilePictureUrl: string }) => void;
}

const EditProfileModal = ({ isOpen, onClose, currentName, currentBio, currentPictureUrl, onSuccess }: EditProfileModalProps) => {
    const [name, setName] = useState(currentName || '');
    const [bio, setBio] = useState(currentBio || '');
    const [pictureUrl, setPictureUrl] = useState(currentPictureUrl || '');

    const [uploadingImage, setUploadingImage] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        setError('');

        try {
            // Upload to Cloudinary directly, identically to ArtworkUpload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'arttrident_preset');

            const res = await fetch('https://api.cloudinary.com/v1_1/dttrmw0xs/image/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
                setPictureUrl(data.secure_url);
            } else {
                setError('Failed to upload image to Cloudinary.');
            }
        } catch (err) {
            console.error('Image upload failed', err);
            setError('An error occurred during image upload.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            await apiClient.put('/users/profile', {
                name,
                bio,
                profilePictureUrl: pictureUrl,
            });
            onSuccess({ name, bio, profilePictureUrl: pictureUrl });
            onClose();
        } catch (err) {
            console.error('Profile update failed:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 overflow-hidden animate-scale-in">

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-neutral-900 mb-8">Edit Profile</h2>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-neutral-100 border-4 border-white shadow-lg group">
                            {pictureUrl ? (
                                <img src={pictureUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                    <Upload className="w-8 h-8" />
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                            >
                                {uploadingImage ? (
                                    <Loader className="w-6 h-6 text-white animate-spin" />
                                ) : (
                                    <span className="text-white text-sm font-medium">Change</span>
                                )}
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <p className="text-xs text-neutral-500">Square images work best</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-neutral-900 mb-2">Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-neutral-900 mb-2">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell us about yourself and your art..."
                                rows={4}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all outline-none resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-full font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || uploadingImage}
                            className="px-8 py-3 bg-neutral-900 text-white rounded-full font-bold hover:bg-neutral-800 transition-all transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
