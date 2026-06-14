import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Video } from '../../models/video.model';
import { VideoCardComponent } from './video-card.component';

const VIDEO: Video = {
  id: 6963395,
  width: 1080,
  height: 1920,
  duration: 135,
  url: 'https://www.pexels.com/video/a-person-holding-a-eucalyptus-plant-with-soil-6963395/',
  image: 'https://images.pexels.com/videos/6963395/poster.jpeg',
  user: { id: 1, name: 'Cup of Couple', url: 'https://pexels.com/@cup' },
  video_files: [],
};

describe('VideoCardComponent', () => {
  let fixture: ComponentFixture<VideoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoCardComponent);
    fixture.componentRef.setInput('video', VIDEO);
    fixture.detectChanges();
  });

  it('renders the poster with a descriptive alt', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('src')).toBe(VIDEO.image);
    expect(img.getAttribute('alt')).toContain('Cup of Couple');
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('renders the title derived from the url', () => {
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('A person holding a eucalyptus plant with soil');
  });

  it('renders the author name', () => {
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Cup of Couple');
  });

  it('renders the formatted duration', () => {
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('2:15');
  });

  it('links to the player route', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('href')).toBe('/video/6963395');
  });
});
