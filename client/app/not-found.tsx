import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#252542] flex flex-col items-center justify-center p-5 font-sans">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
        <h1 className="text-6xl font-extrabold m-0 mb-4 bg-gradient-to-br from-purple-400 to-indigo-500 text-transparent bg-clip-text">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-[#a0a0b0] mb-8 leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="inline-block bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-none rounded-xl py-3 px-8 font-semibold cursor-pointer transition-transform duration-200 no-underline hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-indigo-500/25"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
