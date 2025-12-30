/**
 * GuidedPlayer.js
 * YouTube video player for guided meditation sessions.
 * Controls are locked - only Exit and Fullscreen buttons work.
 */

// Curated meditation videos
const GUIDED_VIDEOS = [
    {
        id: 'SgEQrUIKJ6Y',
        title: 'Japanese Stream',
        duration: '3h',
        thumbnail: 'https://img.youtube.com/vi/SgEQrUIKJ6Y/hqdefault.jpg'
    },
    {
        id: '9Yglpp9dU38',
        title: 'Spring Forest',
        duration: '2h',
        thumbnail: 'https://img.youtube.com/vi/9Yglpp9dU38/hqdefault.jpg'
    },
    {
        id: '8OCfQWyqWto',
        title: 'Lake & Piano',
        duration: '12h',
        thumbnail: 'https://img.youtube.com/vi/8OCfQWyqWto/hqdefault.jpg'
    }
];

export class GuidedPlayer {
    constructor(containerId) {
        this.containerId = containerId;
        this.player = null;
        this.isReady = false;
        this.isPlaying = false;
        this.currentVideoId = null;
    }

    /**
     * Get list of curated videos
     */
    static getVideos() {
        return GUIDED_VIDEOS;
    }

    /**
     * Initialize YouTube API
     */
    init() {
        return new Promise((resolve) => {
            // Check if API is already loaded
            if (window.YT && window.YT.Player) {
                this.isReady = true;
                resolve();
                return;
            }

            // Load YouTube IFrame API
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // Wait for API to be ready
            window.onYouTubeIframeAPIReady = () => {
                this.isReady = true;
                resolve();
            };
        });
    }

    /**
     * Load and play a video
     */
    loadVideo(videoId) {
        this.currentVideoId = videoId;
        const container = document.getElementById(this.containerId);

        // Show container
        container.style.display = 'block';

        // Destroy existing player if any
        if (this.player) {
            this.player.destroy();
        }

        // Create player
        this.player = new YT.Player('youtube-player', {
            width: '100%',
            height: '100%',
            videoId: videoId,
            playerVars: {
                autoplay: 1,
                controls: 0,        // Hide controls
                disablekb: 1,       // Disable keyboard
                fs: 0,              // Hide fullscreen button
                modestbranding: 1,  // Reduce branding
                rel: 0,             // No related videos at end
                showinfo: 0,        // Hide video info
                iv_load_policy: 3,  // Hide annotations
                playsinline: 1,     // Inline playback on mobile
                loop: 1,            // Loop video
                playlist: videoId   // Required for loop to work
            },
            events: {
                onReady: (event) => {
                    event.target.playVideo();
                    this.isPlaying = true;
                },
                onStateChange: (event) => {
                    // Auto-replay if video ends
                    if (event.data === YT.PlayerState.ENDED) {
                        event.target.playVideo();
                    }
                }
            }
        });
    }

    /**
     * Stop video and hide container
     */
    stop() {
        if (this.player) {
            this.player.stopVideo();
            this.player.destroy();
            this.player = null;
        }
        this.isPlaying = false;
        this.currentVideoId = null;

        const container = document.getElementById(this.containerId);
        container.style.display = 'none';

        // Clear player div
        const playerDiv = document.getElementById('youtube-player');
        if (playerDiv) {
            playerDiv.innerHTML = '';
        }
    }

    /**
     * Check if currently playing
     */
    getIsPlaying() {
        return this.isPlaying;
    }
}
