# frozen_string_literal: true

# sm_thumbnails.rb
#
# Generates the responsive "sm" (small) variants of post background images at
# build time, so they never have to be created or committed by hand.
#
# The homepage post cards (_layouts/home.html) use a <img srcset> that serves a
# 768px-wide WebP on small screens and the full-size hero on larger ones. The
# small candidate lives at /img/posts/sm/<name>, mirroring the full-size image
# under /img/posts/<name>. Previously each sm/<name>.webp had to be produced and
# committed manually (and was easy to forget — see the "missing sm/9.webp" fix),
# so this generator derives them automatically from each post's `background`.
#
# Nothing is written into the source tree: every variant is produced straight
# into the built site (_site/img/posts/sm/) at write time via ImageMagick.
#
# Requires ImageMagick (`magick` on IM7, `convert` on IM6) with the WebP
# delegate on PATH — already a build dependency for jekyll-favicon.

module SmThumbnails
  # Width (px) of the generated variant. Matches the 768w descriptor declared
  # in the homepage card srcset (_layouts/home.html).
  WIDTH = 768

  # WebP quality for the re-encoded variant.
  QUALITY = 82

  # Directory holding the full-size post backgrounds, and the sub-directory the
  # generated variants are placed under (both relative to the site source).
  POSTS_DIR = "img/posts"
  SM_DIR    = "img/posts/sm"

  # The ImageMagick CLI to use: IM7 ships `magick`, IM6 ships `convert`.
  # Resolved once and memoized; nil when neither is on PATH.
  def self.magick_command
    return @magick_command if defined?(@magick_command)

    @magick_command = %w[magick convert].find do |cmd|
      ENV.fetch("PATH", "").split(File::PATH_SEPARATOR).any? do |dir|
        File.executable?(File.join(dir, cmd))
      end
    end
  end

  # A static file whose "source" is a full-size post background and whose
  # written output is a width-#{WIDTH} WebP thumbnail. Because #path points at
  # the original image, Jekyll's modified?/mtime tracking keys off the real
  # input, so a variant is regenerated only when its source changes.
  class Thumbnail < Jekyll::StaticFile
    def initialize(site, source_image, dir, name)
      super(site, site.source, dir, name)
      @source_image = source_image
    end

    # Resize from the original image rather than the (non-existent) sm/ source.
    def path
      @source_image
    end

    private

    # Overrides Jekyll::StaticFile#copy_file: instead of copying the file, emit a
    # resized WebP into the destination. Raises on failure so a broken build is
    # loud rather than silently shipping cards with 404 thumbnails.
    def copy_file(dest_path)
      cmd = SmThumbnails.magick_command
      ok = system(
        cmd, @source_image,
        "-resize", "#{WIDTH}x>", # cap width at WIDTH, never enlarge
        "-strip",                # drop metadata
        "-quality", QUALITY.to_s,
        dest_path
      )
      return if ok

      raise "sm_thumbnails: failed to generate #{dest_path} from #{@source_image}"
    end
  end

  class Generator < Jekyll::Generator
    priority :low

    def generate(site)
      backgrounds = collect_backgrounds(site)
      return if backgrounds.empty?

      unless SmThumbnails.magick_command
        raise "sm_thumbnails: ImageMagick (magick/convert) not found on PATH; " \
              "it is required to generate /#{SM_DIR} card thumbnails."
      end

      generated = 0
      backgrounds.each do |relative|
        source_image = site.in_source_dir(relative)
        unless File.file?(source_image)
          Jekyll.logger.warn "sm_thumbnails:", "background not found, skipping #{relative}"
          next
        end

        site.static_files << Thumbnail.new(
          site, source_image, "/#{SM_DIR}", File.basename(relative)
        )
        generated += 1
      end

      Jekyll.logger.info "sm_thumbnails:", "queued #{generated} card thumbnail(s)"
    end

    private

    # Unique set of post background images that live under /#{POSTS_DIR}, plus
    # the homepage default. Backgrounds outside /#{POSTS_DIR} (e.g. hello-world's
    # /img/me-animated.webp) are skipped — home.html renders those without a
    # srcset, so they need no sm variant.
    def collect_backgrounds(site)
      # _layouts/home.html falls back to this when a post has no background.
      defaults = ["/#{POSTS_DIR}/1.webp"]
      from_posts = site.posts.docs.map { |doc| doc.data["background"] }

      (defaults + from_posts).compact
        .map { |bg| bg.sub(%r{\A/}, "") }                 # strip leading slash
        .select { |bg| bg.start_with?("#{POSTS_DIR}/") }  # only /img/posts/*
        .reject { |bg| bg.start_with?("#{SM_DIR}/") }     # never recurse into sm/
        .uniq
    end
  end
end
