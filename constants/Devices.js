// The MIT License (MIT)
//
// Copyright (c) 2014 Koen Bok
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Devices, taken from the framerjs codebase
// Devices have pixel density of 2, but we also zoom in for visibility at small sizes.
export default {
  phone: {
    ios: {
      deviceImageUrl: 'https://cdn.rawgit.com/koenbok/Framer/master/extras/DeviceResources/iphone-6-silver.png',
      deviceImageWidth: 870,
      deviceImageHeight: 1738,
      screenWidth: 750,
      screenHeight: 1334,
    },
    android: {
      deviceImageUrl: 'https://cdn.rawgit.com/koenbok/Framer/master/extras/DeviceResources/google-nexus-5x.png',
      deviceImageWidth: 1204,
      deviceImageHeight: 2432,
      screenWidth: 1080,
      screenHeight: 1920,
    },
  },
  tablet: {
    ios: {
      deviceImageUrl: 'https://cdn.rawgit.com/koenbok/Framer/master/extras/DeviceResources/apple-ipad-pro-silver.png',
      deviceImageWidth: 2448,
      deviceImageHeight: 3432,
      screenWidth: 2048,
      screenHeight: 2732,
    },
    android: {
      deviceImageUrl: 'https://cdn.rawgit.com/koenbok/Framer/master/extras/DeviceResources/google-nexus-9.png',
      deviceImageWidth: 1896,
      deviceImageHeight: 2648,
      screenWidth: 1536,
      screenHeight: 2048,
    }
  },
}
