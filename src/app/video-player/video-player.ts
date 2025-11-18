import { Component } from '@angular/core';
import { YouTubePlayerModule } from '@angular/youtube-player';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [YouTubePlayerModule],
  templateUrl: './video-player.html',
  styleUrl: './video-player.css',
})
export class VideoPlayer {
  // videoId = 'oHg5SJYRHA0'; // Example video ID
  videoId = 'OvIr5xx-Lmc'; // Example video ID
}
