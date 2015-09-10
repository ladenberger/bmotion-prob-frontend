# BMotion Studio for ProB Frontend

[![Build Status](https://travis-ci.org/ladenberger/bmotion-prob-frontend.svg?branch=develop)](https://travis-ci.org/ladenberger/bmotion-prob-frontend)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

## Build

Run the following command for building the standalone version of BMotion Studio for ProB, where xxx is the target platform:

```
gradle clean standalone_xxx
```

The following values are allowed for xxx: linux-x64, linux-ia32, darwin-x64, win32-ia32, win32-x64.

Or just run the following command for building the standalone version for all platforms:

```
gradle clean standalone_all
```

The build script will produce a zipped standalone version for all platforms. The zip files are located in the build/dist folder.

## No Gradle installed?

If you don't have gradle installed, you can use the gradlew script provided. For instance, use

```
./gradlew clean standalone_linux-x64
```

to build the standalone version for linux x64.

This should build the application without a gradle installation on your computer.
