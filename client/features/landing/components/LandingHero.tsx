import Link from 'next/link';

export function LandingHero() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] text-white font-sans flex flex-col">
      <header className="flex justify-between items-center py-5 px-10 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">LiveChat</div>
        <div className="flex gap-5 items-center">
          <Link href="/login" className="text-white font-medium py-2 px-4 rounded-lg transition-colors hover:bg-white/10">Log In</Link>
          <Link href="/register" className="text-white font-medium py-2 px-4 rounded-lg transition-colors bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">Sign Up</Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col justify-center items-center text-center px-5">
        <h1 className="text-6xl font-extrabold mb-6 leading-tight">Connect Instantly with LiveChat</h1>
        <p className="text-xl text-slate-400 max-w-[600px] mb-10 leading-relaxed">
          Join rooms, chat in real-time, and experience seamless communication with a beautiful glassmorphic interface.
        </p>
        <Link href="/register" className="inline-block py-4 px-8 text-lg font-semibold text-white bg-gradient-to-br from-purple-500 to-blue-500 rounded-full shadow-[0_10px_25px_rgba(168,85,247,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(168,85,247,0.5)]">Get Started for Free</Link>
      </main>
    </div>
  );
}
