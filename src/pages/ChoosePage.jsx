// TailwindVersion.jsx
import React from "react";

const TailwindDestinationSelector = () => {
  const [selected, setSelected] = React.useState("");

  return (
    <div className="min-h-screen bg-[#0F796D] flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-3xl shadow p-6">
        {/* Title */}
        <h2 className="text-2xl font-[700] text-[#0F796D] text-center mb-8 pb-4 ">
          Choose destination
        </h2>

        <div
          className={`flex items-start p-4 mb-3 rounded-xl  cursor-pointer transition-colors bg-[#47CC7C]
           `}
        >
          <div className="mr-5 mt-0.5">
            <img src="logo.png" width={50} height={50} alt="" />
          </div>

          <div className="flex-1 text-white text-left">
            <div className=" font-medium mb-1">Whatsapp</div>
            <div className="text-sm ">Customer chat interface</div>
          </div>
        </div>

        <div
          className={`flex items-start p-4 mb-6 rounded-xl  cursor-pointer transition-colors bg-[#47CC7C]`}
        >
          <div className="mr-5 mt-0.5">
            <img src="Vector.png" width={40} alt="" />
          </div>

          <div className="flex-1 text-white text-left">
            <div className=" font-medium mb-1">Control panel</div>
            <div className="text-sm">Settings and management</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindDestinationSelector;
