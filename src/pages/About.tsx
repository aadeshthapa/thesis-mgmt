import React from "react";
import Navbar from "../components/layout/Navbar";

const About: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About KOI</h1>

        <div className="prose prose-lg">
          <p className="mb-6">
            King's Own Institute (KOI) is a leading private institution of
            higher education located in central Sydney, Australia and offering
            high quality accredited diploma, undergraduate and postgraduate
            courses in Accounting, Business, Management, Information Technology
            (IT) and postgraduate courses in TESOL (Teaching English to Speakers
            of Other Languages).
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Heritage</h2>
            <p>
              Named after a regiment of the British army with which the CEO and
              Dean was associated as an exchange officer, King's Own Institute
              adopts a similar spirit and values with traditions and an
              established reputation for its recognised development of
              successful leaders.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">The KOI Symbol</h2>
            <p>
              Our initials KOI have a second meaning, as the word "koi" in some
              Asian languages is a wild carp. The koi is energetic and can swim
              upstream against the current. According to legend if a koi
              succeeded in climbing the falls at a point called Dragon Gate on
              the Yellow River it would be transformed into a dragon. This
              demonstrates perseverance in adversity and strength of purpose.
            </p>
          </div>

          <blockquote className="border-l-4 border-indigo-500 pl-4 italic my-8">
            Here at King's Own Institute, we want the career-shaping experience
            to be fruitful, memorable and enjoyable.
          </blockquote>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Our Facilities</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Modern computer facilities with latest technology</li>
                <li>Campus-wide WiFi with generous data allowance</li>
                <li>Specially designed library with specialist librarian</li>
                <li>Comfortable student lounges with practical amenities</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Campus Locations</h3>
              <ul className="space-y-2">
                <li>Market Street, Sydney</li>
                <li>Kent Street, Sydney</li>
                <li>O'Connell Street, Sydney</li>
                <li>Darby Street, Newcastle</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
