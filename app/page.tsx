'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Github, Twitter, Linkedin } from 'lucide-react'

import { siteConfig } from './siteConfig'

export default function Home() {
  const [showHistory, setShowHistory] = useState(false)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-8 text-center md:text-left bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
          {siteConfig.name.first}
          <br />
          {siteConfig.name.last}
        </h1>
        <div className="relative inline-block">
          <motion.div>
            <div 
              className="relative group"
              onMouseEnter={() => setShowHistory(true)}
              onMouseLeave={() => setShowHistory(false)}
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-lg text-gray-500 dark:text-gray-400 text-center md:text-left"
              >
                <span 
                  className='opacity-90 hover:opacity-100 hover:text-white transition duration-100 cursor-pointer hidden md:inline'
                  onMouseEnter={() => setShowHistory(true)}
                  onMouseLeave={() => setShowHistory(false)}
                >
                  {siteConfig.bio.primary.text}
                </span>
                <span className='md:hidden'>
                  {siteConfig.bio.primary.text}
                </span>
                <br />
                {siteConfig.bio.secondary}
                <br />
                {siteConfig.bio.location}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="flex gap-4 mt-4 justify-center md:justify-start"
              >
                <a 
                  href={siteConfig.social.github}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="opacity-50 hover:opacity-100 transition duration-100"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href={siteConfig.social.twitter}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="opacity-50 hover:opacity-100 transition duration-100"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href={siteConfig.social.linkedin}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="opacity-50 hover:opacity-100 transition duration-100"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </motion.div>

              <AnimatePresence>
                {showHistory && 
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="absolute left-full ml-12 top-0 w-80 text-left hidden md:block"
                  >
                    <div className="space-y-6 pt-1 pb-4">
                      {siteConfig.workHistory.map((work, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <span className="text-sm text-gray-500 w-24">{work.period}</span>
                          <div>
                            <a 
                              href={work.url}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-normal opacity-90 hover:opacity-100 hover:text-white transition duration-100 cursor-pointer inline-flex items-center gap-1"
                            >
                              {work.company}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <p className="text-sm text-gray-500">{work.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </main>
  )
}