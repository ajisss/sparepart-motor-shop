// Icons sourced from Figma (fileKey g5t7sM0rQDvppxhMIyRnAF) Login/Register frames,
// re-assembled as standalone React SVG components (real vector data, not hand-drawn).

export function GoogleIcon({ className = 'size-5' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.6 10.23c0-.68-.06-1.33-.17-1.96H10v3.71h5.38a4.6 4.6 0 01-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.27z"
        fill="#518EF8"
      />
      <path
        d="M10 20c2.7 0 4.96-.89 6.61-2.4l-3.23-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H1.06v2.59A10 10 0 0010 20z"
        fill="#28B446"
      />
      <path
        d="M4.42 11.94A6 6 0 014.09 10c0-.67.12-1.32.33-1.94V5.47H1.06A10 10 0 000 10c0 1.61.39 3.14 1.06 4.53l3.36-2.59z"
        fill="#FBBB00"
      />
      <path
        d="M10 3.96c1.47 0 2.79.5 3.83 1.49l2.87-2.87C14.95.99 12.7 0 10 0 6.09 0 2.71 2.24 1.06 5.47l3.36 2.59C5.2 5.7 7.4 3.96 10 3.96z"
        fill="#F14336"
      />
    </svg>
  )
}

export function EyeIcon({ className = 'size-5', open = true }) {
  if (!open) {
    return (
      <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2.5 2.5l15 15M8.23 8.23a2.5 2.5 0 003.54 3.54M6.1 6.13C4.27 7.22 2.9 8.9 2.5 10c1.26 3.5 4.5 5.83 7.5 5.83 1.13 0 2.27-.32 3.32-.9M9.13 4.2c.29-.02.58-.03.87-.03 3 0 6.24 2.33 7.5 5.83-.31.86-.79 1.72-1.4 2.5"
          stroke="#102100"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.7683 8.23333C12.7442 9.20917 12.7442 10.7933 11.7683 11.7708C10.7925 12.7467 9.20833 12.7467 8.23083 11.7708C7.255 10.795 7.255 9.21083 8.23083 8.23333C9.20833 7.25583 10.7917 7.25583 11.7683 8.23333"
        stroke="#102100"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.5 10C2.5 9.45083 2.62667 8.9075 2.87167 8.40667C4.13417 5.82583 6.92417 4.16667 10 4.16667C13.0758 4.16667 15.8658 5.82583 17.1283 8.40667C17.3733 8.9075 17.5 9.45083 17.5 10C17.5 10.5492 17.3733 11.0925 17.1283 11.5933C15.8658 14.1742 13.0758 15.8333 10 15.8333C6.92417 15.8333 4.13417 14.1742 2.87167 11.5933C2.62667 11.0925 2.5 10.5492 2.5 10Z"
        stroke="#102100"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
