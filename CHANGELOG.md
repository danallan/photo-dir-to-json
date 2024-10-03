

## [1.2.2](https://github.com/danallan/photo-dir-to-json/compare/1.2.1...1.2.2) (2024-10-03)

## [1.2.1](https://github.com/danallan/photo-dir-to-json/compare/1.2.0...1.2.1) (2024-04-12)

## [1.2.0](https://github.com/danallan/photo-dir-to-json/compare/1.1.0...1.2.0) (2024-03-22)


### Features

* Add optional id and alt photo properties from XMP metadata ([5c9a4b6](https://github.com/danallan/photo-dir-to-json/commit/5c9a4b6fec473993669d62261684c09b878e62b2))
* Add order property to input metadata ([e90823c](https://github.com/danallan/photo-dir-to-json/commit/e90823c1415510f25dd2276c29f89e70b2422511))


### Bug Fixes

* Ensure album thumb file is in set of allowedExtensions ([1c609b2](https://github.com/danallan/photo-dir-to-json/commit/1c609b2f090a3454e4cddc1fa6ea601e855604e6))

## [1.1.0](https://github.com/danallan/photo-dir-to-json/compare/1.0.2...1.1.0) (2024-03-18)


### Features

* Add unlisted getter to Album ([de3578e](https://github.com/danallan/photo-dir-to-json/commit/de3578e8793fbd98188c4f26b9e617f9f2151afe))


### Bug Fixes

* align path resolution behavior across all classes ([1a241ab](https://github.com/danallan/photo-dir-to-json/commit/1a241ab4eb6d40ec8e4e22deae3fcb94c85d0291))
* Remove needless caching from internal Directory class ([c6ad67a](https://github.com/danallan/photo-dir-to-json/commit/c6ad67acdea1bb18bb32bb45049fe585d0de1dda))
* Rename test/images to test/Images for case-sensitive filesystems ([#1](https://github.com/danallan/photo-dir-to-json/issues/1)) ([4daee50](https://github.com/danallan/photo-dir-to-json/commit/4daee505c18066e2dd7366964ac2910f32e5063f))
* Throw more helpful error earlier if image is invalid ([54436a6](https://github.com/danallan/photo-dir-to-json/commit/54436a669569d24705c2f60f4b5c06595a6518b7))

## [1.0.2](https://github.com/danallan/photo-dir-to-json/compare/1.0.1...1.0.2) (2024-03-14)


### Bug Fixes

* dir provided to Photo resolved to absolute path ([50391fb](https://github.com/danallan/photo-dir-to-json/commit/50391fb6ceab5faa4aa2efe04ad59003bccfe0c1))
* EXIF timezone offset field parsed properly ([f39b1bb](https://github.com/danallan/photo-dir-to-json/commit/f39b1bbd83733f35d3912f608e2e6253e3acd810))
* Improve subsec resolution to 3 digits ([fd5f7ac](https://github.com/danallan/photo-dir-to-json/commit/fd5f7ac7e390dbde3fdaf679888983b5e9d3350b))
* IPTC date and time metadata support ([a0f0e17](https://github.com/danallan/photo-dir-to-json/commit/a0f0e173b4cccec2114f0482bcbb5727f5233f08))
* Use EXIF Original tags for create date ([57380fe](https://github.com/danallan/photo-dir-to-json/commit/57380fe328c70fb9c19a79e1c4dba0cc4943e1ce))

## [1.0.1](https://github.com/danallan/photo-dir-to-json/compare/1.0.0...1.0.1) (2024-03-12)


### Bug Fixes

* Align all photo date detection to create date ([cd0696b](https://github.com/danallan/photo-dir-to-json/commit/cd0696b0c8f4a495834f00db00f1aa3fd5832248))

## 1.0.0 (2024-03-12)


### Features

* Add save metadata convenience methods ([f64cdd7](https://github.com/danallan/photo-dir-to-json/commit/f64cdd7720c61d89c1c8a8090aeafb6fd3de596e))
* initial commit, refactored from local script ([1f8ccc8](https://github.com/danallan/photo-dir-to-json/commit/1f8ccc82cc27a01d90eef7a468ab9837d66f10be))
