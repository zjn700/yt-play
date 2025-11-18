// import { Component, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // needed for keyboard events

@Component({
  selector: 'app-youtube-embed',
  imports: [FormsModule, CommonModule],
  templateUrl: './youtube-embed.html',
  styleUrl: './youtube-embed.css',
})
export class YoutubeEmbed {
  @Input() videoId = '';
  @Input() params = 'rel=0&modestbranding=1&enablejsapi=1';
  url?: SafeResourceUrl;
  @Input() playbackOption: 'default' | 'high' | 'low' | string = 'default';
  @Input() jumpLength: 5 | 10 | 25 | number = 10;
  // ready = signal(false);
  // stateChange = signal(false);
  @Output() ready = new EventEmitter<any>();
  @Output() stateChange = new EventEmitter<any>();
  videoDuration: number | null = null; // Store video duration
  videoTitle = '';

  @Output() focusRequest = new EventEmitter<void>();

  player: any = null;
  duration = 0;
  currentTime = 0;
  startSec = 5;
  private updateInterval: number | null = null;
  height = 400;
  width = this.height * (16 / 9);

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadYouTubeIframeApi();
    window.addEventListener('keydown', this.onKeyDown as any);
    this.requestParentFocus();
  }
  requestParentFocus() {
    console.log('Child: Emitting focus request...');
    this.focusRequest.emit();
  }
  ngOnChanges(_: SimpleChanges) {
    if (this.videoId) {
      const raw = `https://www.youtube-nocookie.com/embed/${this.videoId}?${this.params}`;
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(raw);
      console.log('Video URL---:', this.url);
    }
  }

  private onKeyDown = (ev: KeyboardEvent) => {
    // ignore when typing in input fields
    const target = ev.target as HTMLElement | null;
    if (target?.tagName === 'INPUT') {
      return;
    }
    if (ev.key === 'Enter') {
      console.log('Enter key pressed');
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === 'p') {
      console.log('P key pressed');
      this.playOnce();
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === 'l') {
      console.log('L key pressed for loop toggle');
      this.togglePlayPause();
      this.player.getCurrentTime(); // Get the current time
      // console.log('toggling loop', this.isLooping);
      // if (this.isLooping) this.stopLoop();
      // else this.startLoop();
      // console.log('toggled loop', this.isLooping);
      return;
    }
    switch (ev.key) {
      case ' ': {
        //space
        // this.postMessage('playVideo');
        console.log('Space');
        ev.preventDefault();
        this.togglePlayPause();

        break;
      }
      case 'ArrowRight': {
        // Forward
        // this.postMessage('nextVideo');
        console.log('ArrowRight', this.jumpLength);
        this.player.pauseVideo();
        this.seekBy(this.jumpLength);
        // ev.preventDefault();
        break;
      }
      case 'ArrowLeft': {
        // Backward
        // this.postMessage('prevVideo');
        console.log('ArrowLeft', -this.jumpLength);
        this.seekBy(-this.jumpLength);
        // ev.preventDefault();
        break;
      }
    }
  };

  private seekBy(delta: number) {
    if (!this.player || typeof this.player.getCurrentTime !== 'function') return;
    const now = this.player.getCurrentTime();
    const newTime = Math.max(0, Math.min(this.duration || 0, now + delta));
    this.player.seekTo(newTime, true);
    this.currentTime = newTime;
  }

  private loadYouTubeIframeApi() {
    if ((window as any).YT?.Player) {
      this.createPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

    (window as any).onYouTubeIframeAPIReady = () => {
      this.createPlayer();
    };
  }

  private createPlayer() {
    if (this.player?.destroy) {
      this.player.destroy();
    }

    this.player = new (window as any).YT.Player('player', {
      // height: this.height,
      // width: this.height * 1.7777,
      // width: this.width,
      // width: this.height * (16 / 9),
      videoId: this.videoId,
      playerVars: { rel: 0, modestbranding: 1, disablekb: 1, enablejsapi: 1, controls: 0 },
      events: {
        onReady: (e: any) => {
          // get video title
          this.videoTitle = this.player.getVideoData().title || '';
          // read duration once player is ready
          this.duration = this.player.getDuration() || 0;
          console.log('Duration:', this.duration);

          // try to update duration again later in case it's 0 initially
          setTimeout(() => {
            this.duration = this.player.getDuration() || this.duration;
          }, 1000);
          this.startUpdating();
          this.playOnce();
          this.ready.emit(e);
        },
        onStateChange: () => {
          /* no-op here */
        },
      },
    });
  }

  private startUpdating() {
    // this.stopUpdating();
    this.updateInterval = window.setInterval(() => {
      if (this.player?.getCurrentTime) {
        this.currentTime = this.player.getCurrentTime();
      }
      // refresh duration if available later
      if (this.player?.getDuration) {
        const d = this.player.getDuration();
        if (d && d !== this.duration) this.duration = d;
      }
    }, 150);
  }

  playOnce() {
    if (!this.player) {
      this.createPlayer();
      setTimeout(() => this.playOnce(), 300);
      return;
    }
    this.player.seekTo(Number(this.startSec) || 0, true);
    this.player.playVideo();
    // this.isLooping = false;
    // this.stopLoop();
  }

  private togglePlayPause() {
    if (!this.player) return;
    try {
      const state = this.player.getPlayerState();
      // YT.PlayerState.PLAYING === 1
      if (state === 1) {
        this.player.pauseVideo();
      } else {
        this.player.playVideo();
      }
    } catch {
      // fallback: call playVideo
      this.player.playVideo?.();
    }
  }
}
// onPlayerReady(event: any) {
//   // Get the duration when the player is ready
//   event.target.getDuration().then((duration: number) => {
//     this.videoDuration = duration;
//     console.log('Video Duration:', this.videoDuration);
//   });
// }
// onPlayerStateChange(event: any) {
//   console.log('Player State Changed:', event.data);
// }
