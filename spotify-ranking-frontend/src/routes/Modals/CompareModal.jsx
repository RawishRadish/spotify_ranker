import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CompareModal = ({onClose, fetchSongs }) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleContinue = () => {
        setLoading(true);
        try {
            fetchSongs();
        } catch (error) {
            console.error('Error fetching new batch of pairs:', error);
        } finally {
            setLoading(false);
            onClose();
        }
    }

    return (
        <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm px-4'>
            <div className='bg-gray-900 text-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-6'>
                <div className='text-center'>
                    <h2 className='font-bold text-2xl mb-2'>Batch voltooid!</h2>
                    <p className='text-gray-300'>Je hebt 50 nummers vergeleken. Wat wil je nu doen?</p>
                </div>

                <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                    <button
                        onClick={handleContinue}
                        disabled={loading}
                        className='bg-green-500 text-black font-semibold px-4 py-2 rounded-xl hover:bg-green-400 transition disabled:opacity-50'
                    >
                        {loading ? 'Nieuwe batch ophalen...' : 'Verder met ranken'}
                    </button>
                    <button
                        onClick={() => navigate('/ranking')}
                        disabled={loading}
                        className='bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition disabled:opacity-50'
                    >
                        Ranglijst bekijken
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        disabled={loading}
                        className='border border-white text-white px-4 py-2 rounded-xl hover:bg-white hover:text-black transition disabled:opacity-50'
                    >
                        Terug naar beginscherm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompareModal;