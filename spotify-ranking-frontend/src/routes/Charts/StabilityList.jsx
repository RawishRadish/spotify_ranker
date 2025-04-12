const StabilityList = ({ data, title, color, compact = false, maxLines = 2 }) => (
    <div>
        <h3 className={`text-sm font-medium mb-2 ${color}`}>{title}</h3>
        <ul className='space-y-1'>
            {data.map((item, index) => (
                <li 
                    key={index} 
                    className='flex justify-between gap-4 text-sm bg-gray-50 px-3 py-2 rounded'
                >
                    <span 
                        className={`truncate leading-snug ${
                            maxLines > 1 ? `line-clamp-${maxLines}` : 'truncate'
                        }`}
                        title={item.title}
                    >
                        {item.title}
                    </span>
                    <span className={`text-gray-400 whitespace-nowrap ${compact ? 'text-xs' : 'text-sm'}`}>
                        {compact ? `σ: ${item.sigma.toFixed(1)}` : `sigma: ${item.sigma.toFixed(2)}`}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);

export default StabilityList;