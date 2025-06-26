// components/Footer.js

import Link from 'next/link';

function Footer() {
  return (
    <section className="relative overflow-hidden py-10 bg-black text-white border-t-2 border-t-white">
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap">
          <div className="w-full p-6 md:w-1/2 lg:w-6/12 text-center md:text-left">
            <h1 className="text-6xl font-bold mb-4">FashionFinds</h1>
            <p className="text-gray-400 mb-4">
              Discover the latest trends and timeless styles with FashionFinds. We bring you a curated selection of high-quality apparel and accessories, tailored to suit every taste and occasion. From everyday essentials to statement pieces, our collection is designed to help you express your unique style.
            </p>
          </div>
          
          <div className="w-full p-6 md:w-1/2 lg:w-3/12 text-center md:text-center">
            <div className="h-full">
              <h3 className="px-6 mb-6 py-3 text-xs font-bold uppercase text-black bg-white rounded-full">
                Category
              </h3>
              <ul>
                <li className="mb-4">
                  <Link href="/product/listing/men">
                    <span className="text-base font-medium hover:text-gray-300">Men</span>
                  </Link>
                </li>
                <li className="mb-4">
                  <Link href="/product/listing/women">
                    <span className="text-base font-medium hover:text-gray-300">Women</span>
                  </Link>
                </li>
                <li className="mb-4">
                  <Link href="/product/listing/shoes">
                    <span className="text-base font-medium hover:text-gray-300">Shoes</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="w-full p-6 md:w-1/2 lg:w-3/12 text-center md:text-center">
            <div className="h-full">
              <h3 className="px-6 mb-6 py-3 text-xs font-bold uppercase text-black bg-white rounded-full">
                Legals
              </h3>
              <ul>
                <li className="mb-4">
                  <Link href="/">
                    <span className="text-base font-medium hover:text-gray-300">Terms &amp; Conditions</span>
                  </Link>
                </li>
                <li className="mb-4">
                  <Link href="/">
                    <span className="text-base font-medium hover:text-gray-300">Contact Us</span>
                  </Link>
                </li>
                <li >
                  <Link href="/">
                    <span className="text-base font-medium hover:text-gray-300">Privacy Policy</span>
                  </Link>
                </li>
               
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Footer;
