import GlobalState from '@/context'
import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'FashionFinds',
  description: 'Best Fashion Collection',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalState>
          <Navbar/>
          <main className='flex min-h-screen flex-col mt-[80px]'>{children}</main>
          <Footer />
        </GlobalState>
      </body>
    </html>
  )
}
