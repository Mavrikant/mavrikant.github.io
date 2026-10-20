---
title: Merge Files with FFmpeg
subtitle: "Join video clips without re-encoding, using the concat demuxer"
background: "/img/posts/ffmpeg-merge-cover.webp"
date: '2023-03-12 08:00:00'
layout: post
lang: en
categories: [araclar]
tags: [ipuclari, araclar]
---

Write your files list into ```file_list.txt```
```
file /mnt/d/Videos/video_part1.mp4
file /mnt/d/Videos/video_part2.mp4
file /mnt/d/Videos/video_part3.mp4
```


Call following command in bash.
```bash
ffmpeg -safe 0 -f concat -i file_list.txt -c copy video_merged.mp4
```
