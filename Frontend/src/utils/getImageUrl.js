const IMAGE_SERVER_URL = 'http://13.238.159.254:5000';

export const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600&h=800';
    
    // If it's already a full HTTP URL or Data URI, return it as-is
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
    }

    // If it already contains '/uploads', just prepend the EC2 URL
    if (imagePath.startsWith('/uploads')) {
        return `${IMAGE_SERVER_URL}${imagePath}`;
    }

    // If it's just a filename like 'image-123.jpg', normalize it by prepending '/uploads/'
    const normalizedPath = imagePath.startsWith('/') ? `/uploads${imagePath}` : `/uploads/${imagePath}`;
    
    return `${IMAGE_SERVER_URL}${normalizedPath}`;
};
