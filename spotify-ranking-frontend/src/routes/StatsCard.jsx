const StatsCard = ({ title, value, color = 'text-blue-600' }) => {
    return (
        <div className='bg-white shadow-md rounded-xl p-4 gap-1 flex flex-col items-center text-center'>
            <p className='text-sm text-gray-500'>{title}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
    );
};

export default StatsCard;