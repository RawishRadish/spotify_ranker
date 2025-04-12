const DashboardCard = ({ title, onClick, children, ratio = '4/3' }) => {
    return (
        <div
            className='bg-white flex flex-col items-center justify-center rounded-xl shadow-md p-4 cursor-pointer hover:ring-2 hover:ring-blue-400 transition'
            onClick={onClick}
        >
            <h3 className='text-md font-semibold mb-2'>{title}</h3>
            <div className={`w-full flex items-center aspect-[${ratio}] overflow-hidden`}>
                {children}
            </div>
        </div>
    );
};

export default DashboardCard;