import Image from "next/image";
const PageTopper = ({image, text}) => {
  return (
    <div className="relative">
      <Image
        height={0}
        width={0}
        sizes="100vw"
        priority
        src={image}
        className="w-full h-40 brightness-50 object-cover object-center"
        alt="Frosted cupcake with a cherry on top"
      />
      <div className="absolute left-1/2 top-3/5 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl font-bold uppercase">
        <div className="text-xl text-center lg:text-4xl">{text}</div>
      </div>
    </div>
  );
};

export default PageTopper;
