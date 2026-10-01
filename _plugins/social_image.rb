# frozen_string_literal: true

# social_image.rb
#
# Uses each post's hero image (`background`) as its social-media preview: the
# og:image, twitter:image and JSON-LD "image" emitted by jekyll-seo-tag, and the
# <media:thumbnail> in jekyll-feed's feed.xml.
#
# Both plugins only read a page's `image` field, but posts declare their cover
# as `background` (the field _layouts/post.html renders). The site-wide front
# matter default in _config.yml (`image: /img/og-default.webp`) therefore won on
# every post, so shared links showed the generic card instead of the post cover.
#
# Runs once all content has been read, before anything is generated or
# rendered, so every consumer of `image` sees the same value. A post can still
# pick a dedicated share image by setting `image` in its front matter; pages
# (home, about, contact, ...) keep the og-default card.

Jekyll::Hooks.register :site, :post_read do |site|
  site.posts.docs.each do |post|
    background = post.data["background"]
    next if background.to_s.empty?

    # An `image` equal to the front matter default was not set by the post itself.
    default_image = site.frontmatter_defaults.find(post.relative_path, post.type, "image")
    next unless post.data["image"].nil? || post.data["image"] == default_image

    post.data["image"] = background
  end
end
