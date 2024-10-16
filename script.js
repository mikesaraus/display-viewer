let videoData = []
let currentPage = 1

async function fetchVideoData(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Network response was not ok')
    videoData = await response.json()
    renderVideos()
  } catch (error) {
    console.error('Error fetching video data:', error)
  }
}

function loadVideoDataFromFile(file) {
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      videoData = JSON.parse(event.target.result)
      renderVideos()
    } catch (error) {
      console.error('Error parsing JSON:', error)
    }
  }
  reader.readAsText(file)
}

function renderVideos() {
  const cameraCount = Math.max(1, parseInt(document.getElementById('camera-select').value))
  const totalVideos = videoData.length
  const totalPages = Math.ceil(totalVideos / cameraCount)

  // Update URL and video count
  history.pushState(null, '', `?page=${currentPage}&camera=${cameraCount}`)

  // Clear previous videos
  const videocamera = document.getElementById('video-camera')
  videocamera.innerHTML = ''
  videocamera.setAttribute('camera-count', cameraCount)

  // Calculate range for current page
  const startIndex = (currentPage - 1) * cameraCount
  const endIndex = Math.min(startIndex + cameraCount, totalVideos)

  for (let i = startIndex; i < endIndex; i++) {
    createVideoIframe(videocamera, videoData[i])
  }

  // Update pagination and page info
  updatePagination(totalPages)
}

function createVideoIframe(container, video) {
  const iframeContainer = document.createElement('div')
  const iframe = document.createElement('iframe')
  iframeContainer.classList.add('video-wrapper')

  iframe.src = video.url
  iframe.title = video.title

  iframeContainer.addEventListener('dblclick', () => {
    if (document.fullscreenEnabled) {
      iframe.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable full-screen mode:', err)
      })
    }
  })

  iframeContainer.appendChild(iframe)
  container.appendChild(iframeContainer)
}

function updatePagination(totalPages) {
  document.getElementById('prev').disabled = currentPage === 1
  document.getElementById('next').disabled = currentPage >= totalPages
  document.getElementById('page-info').innerText =
    parseInt(document.getElementById('camera-select').value) === videoData.length
      ? `Viewing all ${videoData.length} videos`
      : `Page ${currentPage} of ${totalPages}`
}

// Event listeners for controls
document.getElementById('camera-select').addEventListener('change', () => {
  currentPage = 1 // Reset to page 1 when camera changes
  renderVideos()
})

document.getElementById('prev').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--
    renderVideos()
  }
})

document.getElementById('next').addEventListener('click', () => {
  const cameraCount = parseInt(document.getElementById('camera-select').value)
  const totalPages = Math.ceil(videoData.length / cameraCount)
  if (currentPage < totalPages) {
    currentPage++
    renderVideos()
  }
})

// Load video data from URL or file
document.getElementById('load-json-url').addEventListener('click', () => {
  const url = document.getElementById('json-url').value
  if (url) fetchVideoData(url)
})

document.getElementById('json-url').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    const url = document.getElementById('json-url').value
    if (url) fetchVideoData(url)
  }
})

document.getElementById('file-input').addEventListener('change', (event) => {
  const file = event.target.files[0]
  if (file) loadVideoDataFromFile(file)
})

// Initialize page from URL parameters
function initializePageFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const page = parseInt(params.get('page'))
  const camera = parseInt(params.get('camera'))

  if (!isNaN(page) && page > 0) currentPage = page
  if (!isNaN(camera) && camera > 0) {
    document.getElementById('camera-select').value = camera
  }

  // Check for initial JSON file or URL input
  const initJsonFile = document.getElementById('file-input')?.files?.[0]
  if (initJsonFile) loadVideoDataFromFile(initJsonFile)
  const initJsonUrl = document.getElementById('json-url').value
  if (initJsonUrl) fetchVideoData(initJsonUrl)
}

// On load
initializePageFromUrl()
