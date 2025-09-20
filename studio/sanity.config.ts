/**
 * This config is used to configure your Sanity Studio.
 * Learn more: https://www.sanity.io/docs/configuration
 */
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {structure} from './src/structure'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {
  presentationTool,
  defineDocuments,
  defineLocations,
  type DocumentLocation,
} from 'sanity/presentation'
import {assist} from '@sanity/assist'

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// Define the home location for the presentation tool
const homeLocation = {
  title: 'Home',
  href: '/',
} satisfies DocumentLocation

function resolveHref(documentType?: string, slug?: string): string | undefined {
  switch (documentType) {
    case 'post':
      return slug ? `/posts/${slug}` : undefined
    case 'page':
      return slug ? `/${slug}` : undefined
    default:
      console.warn('Invalid document type:', documentType)
      return undefined
  }
}

// Main Sanity configuration
export default defineConfig({
  name: 'default',
  title: 'Sanity + Next.js Starter Template',

  projectId,
  dataset,

  plugins: [
    presentationTool({
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: '/',
            filter: `_type == "settings" && _id == "siteSettings"`,
          },
          {
            route: '/:slug',
            filter: `_type == "page" && slug.current == $slug || _id == $slug`,
          },
          {
            route: '/posts/:slug',
            filter: `_type == "post" && slug.current == $slug || _id == $slug`,
          },
        ]),
        locations: {
          settings: defineLocations({
            locations: [homeLocation],
            message: 'This document is used on all pages',
            tone: 'positive',
          }),
          page: defineLocations({
            select: {
              name: 'name',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.name || 'Untitled',
                  href: resolveHref('page', doc?.slug),
                },
              ],
            }),
          }),
          post: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: resolveHref('post', doc?.slug),
                },
                {
                  title: 'Home',
                  href: '/',
                },
              ].filter(Boolean) as DocumentLocation[],
            }),
          }),
        },
      },
      previewUrl: {
        initial: 'https://magical-naiad-9051c3.netlify.app', // Netlify deployed site
        previewMode: {
          enable: '/api/draft-mode/enable',    // Next.js API endpoint for draft mode preview
          disable: '/api/draft-mode/disable',  // Next.js API endpoint to turn it off
        },
      },
      allowOrigins: ['https://magical-naiad-9051c3.netlify.app'], // Allow this domain for embedded previews
    }),
    structureTool({
      structure,
    }),
    unsplashImageAsset(),
    assist(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
