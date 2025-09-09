import Image from 'next/image';

const RealtimeBadge = ({ text = '실시간' }) => {
  return (
    <div className="inline-flex items-center justify-center w-[95px] h-[32px] px-[10px] py-[5px] rounded-[5px] border-[0.5px] bg-gradient-to-r from-[#EE69FF] to-[#6AABFF] text-white text-sm font-normal gap-[10px]">
      <Image 
        src="/images/Chart Arrow Rise.png" 
        alt="Chart Arrow Rise"
        width={15}
        height={15}
      />
      <span>{text}</span>
    </div>
  );
};

export default RealtimeBadge;