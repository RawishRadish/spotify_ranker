const StatisticsModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4'>
            <div className='bg-white rounded-lg shadow-xl max-h-[90vh] max-w-4xl w-full relative flex flex-col'>
                <div className='flex justify-end p-2 border-b'>
                    <button
                        onClick={onClose}
                        className='text-gray-500 hover:text-black text-2xl leading-none'
                    >
                        &times;
                    </button>
                </div>
                <div className='overflow-y-auto p-6'>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default StatisticsModal;