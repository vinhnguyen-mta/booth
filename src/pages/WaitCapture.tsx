import {ChevronLeft, ChevronRight} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useAppStore} from '../store/useAppStore';
import {Layout} from '../components/Layout';
import styles from './Css.module.css';
import {useEffect, useState} from 'react';

export const WaitCapture: React.FC = () => {
    const navigate = useNavigate();
    const {
        setCurrentStep
    } = useAppStore();

    const handleBack = () => {
        setCurrentStep(2);
        navigate('/choose-quantity');
    };

    const handleNext = () => {
        setCurrentStep(4);
        navigate('/list-image');
    };

    const [countdown, setCountdown] = useState(3); // đếm ngược từ 3
    const [capturedCount, setCapturedCount] = useState(0); // ảnh đã chụp
    const totalShots = 8;

    useEffect(() => {
        if (capturedCount >= totalShots) return;

        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }

        if (countdown === 0) {
            // Sau khi đếm ngược xong, tăng số ảnh đã chụp và reset countdown
            setCapturedCount((prev) => prev + 1);
            setCountdown(3);
        }
    }, [countdown, capturedCount]);

    return (
        <Layout>
            <div className={styles.stepContainer}>
                <div
                    className="relative bg-[#dcdcdc] flex flex-col items-center justify-center"
                    style={{width: '1200px', height: '80vh', margin: 'auto'}}
                >

                    {/* Hiển thị số ảnh đã chụp */}
                    <div className="absolute top-4 right-6 text-black font-semibold text-sm">
                        Số ảnh đã chụp {capturedCount}/{totalShots}
                    </div>

                    {/* Vòng tròn đếm số */}
                    {capturedCount <= totalShots && (
                        <div
                            className="w-56 h-56 border-4 border-white rounded-full flex items-center justify-center text-white text-6xl font-bold">
                            {countdown}
                        </div>
                    )}
                </div>

                {/* Left / Right arrows (same style as other screens) */}
                <button
                    aria-label="Prev"
                    onClick={handleBack}
                    className={styles.navButtonLeft}
                >
                    <ChevronLeft className="w-5 h-5"/>
                </button>

                <button
                    aria-label="Next"
                    onClick={handleNext}
                    className={styles.navButtonRight}
                >
                    <ChevronRight className="w-5 h-5"/>
                </button>
            </div>
        </Layout>
    );
};
