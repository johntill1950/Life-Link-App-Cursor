import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-8">
        <Image
          src="/Life-Link.jpg"
          alt="Life Link Logo"
          width={400}
          height={200}
          className="w-full h-auto rounded-lg shadow-lg"
          priority
        />
      </div>

      <div className="text-center text-white mb-12">
        <h1 className="text-4xl font-bold mb-4">Life Link</h1>
        <p className="text-xl">Your Health, Your Life, Your Link</p>
      </div>
      
      <div className="w-full max-w-md space-y-4">
        <Link 
          href="/login"
          className="block w-full bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg text-center hover:bg-blue-50 transition-colors"
        >
          Login
        </Link>
        
        <Link
          href="/register"
          className="block w-full bg-transparent border-2 border-white text-white font-semibold py-3 px-4 rounded-lg text-center hover:bg-white/10 transition-colors"
        >
          Register
        </Link>
      </div>

      <div className="mt-12 text-white/80 text-sm">
        <p>Monitor your health metrics in real-time</p>
        <p className="mt-2">Heart Rate • Oxygen • Movement • Location</p>
      </div>
    </div>
  )
}
