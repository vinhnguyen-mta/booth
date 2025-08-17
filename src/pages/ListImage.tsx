import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Layout } from '../components/Layout';
import styles from './Css.module.css';

export const ListImage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setCurrentStep } = useAppStore();

    const handleBack = () => {
        setCurrentStep(2);
        navigate('/wait-capture');
    };

    const handleNext = () => {
        setCurrentStep(4);
        navigate('/filter-image');
    };

    // try to get images from location.state (sent from Capture), fallback to sample assets
    const initialFromState = (location.state && (location.state as any).images) || null;
    const defaultImages = [
        "/assets/image1.webp",
        "/assets/image2.webp",
        "/assets/image3.webp",
        "/assets/image4.webp",
        "/assets/image5.webp",
        "/assets/image6.webp",
        "/assets/image7.webp",
        "/assets/image8.webp",
    ];

    const [imageUrls, setImageUrls] = useState<string[]>(initialFromState && Array.isArray(initialFromState) && initialFromState.length > 0 ? initialFromState : defaultImages);

    useEffect(() => {
        // if location updates with images later, sync
        if (initialFromState && Array.isArray(initialFromState) && initialFromState.length > 0) {
            setImageUrls(initialFromState);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    const maxSelected = 4;
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    // Click ảnh bên trái để chọn ảnh (nếu chưa chọn maxSelected)
    const handleLeftClick = (url: string) => {
        if (selectedImages.length >= maxSelected) return;
        if (!selectedImages.includes(url)) {
            setSelectedImages([...selectedImages, url]);
        }
    };

    // Click ảnh bên phải để bỏ chọn ảnh
    const handleRightClick = (url: string) => {
        setSelectedImages(selectedImages.filter(img => img !== url));
    };

    const isSelected = (url: string) => selectedImages.includes(url);
    return (
        <Layout>
            <div className="flex items-center justify-center bg-white p-8 gap-12">
                {/* Bên trái - Lưới 3x3 ảnh, ảnh đã chọn hiện ô trống */}
                <div className="grid grid-cols-3 grid-rows-3 gap-2 p-2">
                    {imageUrls.map((url, idx) => (
                        <div
                            key={idx}
                            className={`w-52 h-36 border flex items-center justify-center cursor-pointer ${isSelected(url) ? 'bg-gray-300' : 'bg-center bg-no-repeat'}`}
                            style={isSelected(url) ? {} : { backgroundImage: `url(${url})`, backgroundSize: 'auto 100%' }}
                            onClick={() => !isSelected(url) && handleLeftClick(url)}
                        >
                            {isSelected(url) && <span className="text-gray-600 italic"></span>}
                        </div>
                    ))}
                    {/* Ô cuối cùng - Đếm số lượng */}
                    <div className="w-52 h-36 bg-neutral-900 text-white flex flex-col items-center justify-center">
                        <p className="text-sm font-semibold">Vui lòng chọn ảnh</p>
                        <p className="text-3xl font-bold mt-1">
                            {selectedImages.length}/{imageUrls.length}
                        </p>
                    </div>
                </div>

                {/* Bên phải - khung preview 4 ô */}
                <div className="border-2 border-black bg-black p-4 flex flex-col gap-4">
                    {[...Array(maxSelected)].map((_, idx) => {
                        const url = selectedImages[idx];
                        return (
                            <div
                                key={idx}
                                className="w-[165px] h-[102px] bg-pink-50 bg-center bg-no-repeat border cursor-pointer flex items-center justify-center hover:opacity-80"
                                style={url ? { backgroundImage: `url(${url})`, backgroundSize: 'auto 100%' } : {}}
                                onClick={() => url && handleRightClick(url)}
                            >
                                {!url && <span className="text-gray-400 italic"></span>}
                            </div>
                        );
                    })}
                </div>

                {/* Left / Right arrows (same style as other screens) */}
                {/* <button aria-label="Prev" onClick={handleBack} className={styles.navButtonLeft}>
                    <ChevronLeft className="w-5 h-5" />
                </button> */}

                <button aria-label="Next" onClick={handleNext} className={styles.navButtonRight}>
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </Layout>
    );
};