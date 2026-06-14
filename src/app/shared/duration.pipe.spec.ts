import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  const pipe = new DurationPipe();

  it('formats minutes and seconds', () => {
    expect(pipe.transform(135)).toBe('2:15');
  });

  it('zero-pads the seconds', () => {
    expect(pipe.transform(5)).toBe('0:05');
  });

  it('formats durations over an hour', () => {
    expect(pipe.transform(3661)).toBe('1:01:01');
  });

  it('floors fractional seconds', () => {
    expect(pipe.transform(90.9)).toBe('1:30');
  });

  it('guards null, negative and non-finite input', () => {
    expect(pipe.transform(null)).toBe('0:00');
    expect(pipe.transform(undefined)).toBe('0:00');
    expect(pipe.transform(-5)).toBe('0:00');
    expect(pipe.transform(Infinity)).toBe('0:00');
  });
});
