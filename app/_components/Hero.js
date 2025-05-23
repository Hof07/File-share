import React from 'react';

function Hero() {
  return (
    <section className="relative bg-[#EEF2FF] overflow-hidden">
      {/* Blurred Blobs */}
      <div className="absolute inset-0 z-0">
        <div className="w-[300px] h-[300px] bg-[#cbd5ff] rounded-full blur-[100px] absolute top-10 left-10 opacity-50"></div>
        <div className="w-[400px] h-[400px] bg-[#a78bfa] rounded-full blur-[120px] absolute bottom-10 right-10 opacity-50"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10">
        <div className="mx-auto w-screen max-w-screen-xl px-4 py-[12rem] sm:px-6 sm:py-[12rem] lg:px-8 lg:py-[12rem]">
          <div className="mx-auto max-w-prose text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              <strong className="text-primary"> Upload, Save </strong>
              and easily <br /> <strong className="text-primary"> Share </strong>
              your files in one <br /> place
            </h1>

            <p className="mt-4 text-base text-pretty text-gray-600 sm:text-lg/relaxed">
              Drag and drop your file directly on our cloud and share it with <br />
              your friends securely with password and send it on mail.
            </p>

            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-4 sm:mt-6">
              <a
                className="inline-block rounded border border-primary bg-primary font-medium text-white shadow-sm transition-colors px-16 py-3 hover:bg-[#4f1fff] w-full sm:w-auto text-center"
                href="/upload"
              >
                Get Started
              </a>

              <a
                className="inline-block rounded border border-gray-200 font-medium text-primary shadow-sm transition-colors hover:bg-gray-50 px-16 py-3 hover:text-gray-900 w-full sm:w-auto text-center"
                href="#"
              >
                Learn More
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
