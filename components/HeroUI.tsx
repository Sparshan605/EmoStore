
import localFont from "next/font/local";

const screamFont = localFont({
  src: "../public/fonts/EyesWideSuicide-vVzM.ttf",
  variable: "--font-scream",
});

export function Hero() {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      {/* Text */}
      <div className=" ${screamFont.className} bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent absolute inset-0 flex items-center justify-center  p-6 z-10">
        <h1 className=" font-[ScreamFont] bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent md:text-9xl leading-tight">
          exclusive emo merch
          <span className=" bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent text-lg md:text-5xl font-light opacity-80">
            ----- for the Emo Huzz
          </span>
        </h1>
      </div>
      <div className="flex  h-screen w-full overflow-hidden rounded-2xl">
        <div className="flex-[1.6] overflow-hidden">
          <img
            alt="Emo"
            src="https://i.pinimg.com/1200x/e9/2d/c2/e92dc23f8b4501663e93df6391fcbc7a.jpg"
            className="h-full w-full object-cover object-[center_40%]"
          />
        </div>

        {/* Right: 3 stacked images */}
        <div className=" flex flex-[1] flex-col">
          <div className=" flex-1 overflow-hidden">
            <img
              alt="model1"
              src="https://i.pinimg.com/736x/1f/17/80/1f178031ff4e4515b0fb1d7c781185c3.jpg"
              className="h-full w-full object-cover object-[center_12%]"
            />
          </div>
          {/* <div className="flex-1 overflow-hidden">
              <img
                alt="Avocado"
                src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/avocado.jpeg"
                className="h-full w-full object-cover"
              />
            </div> */}
          <div className="flex-1 overflow-hidden">
            <img
              alt="model2"
              src="https://i.pinimg.com/736x/1f/17/80/1f178031ff4e4515b0fb1d7c781185c3.jpg"
              className="h-full w-full object-cover object-[center_88%] "
            />
          </div>
        </div>
      </div>
    </div>
  );
}
