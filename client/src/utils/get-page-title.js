import defaultSettings from '@/settings'

const title = defaultSettings.title || '爱读书'

export default function getPageTitle(pageTitle) {
  return `${title}`
}
