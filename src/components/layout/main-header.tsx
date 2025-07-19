
"use client";

import Image from "next/image";

const MainHeader = () => {
    return (
        <div className="relative w-full h-[60vh] text-center flex items-center justify-center bg-black">
          <Image
            src="https://placehold.co/1920x1080.png"
            alt="Hero background"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            data-ai-hint="male model"
          />
          <div className="relative border-4 border-primary p-4 shadow-neon-red-strong">
            <h1 className="text-6xl font-serif text-white text-shadow-neon-red">Italo Santos</h1>
          </div>
        </div>
    );
};

export default MainHeader;

    