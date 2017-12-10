// Calculates the zoom level based on window.innerWidth
// accounts for rotation which affects the value of innerWidth.
export default function getZoomLevel() {
    switch (window && window.orientation) {
        case 0:
            return window.innerWidth / screen.width;
        case -90:
        case 90:
            return window.innerWidth / screen.height;
        default:
            return 1;
    }
}
