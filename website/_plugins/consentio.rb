require 'cgi'
require 'json'

module Jekyll
  module Consentio
    LOADER_SRC = '/js/consentio-loader.min.js'.freeze
    SETTINGS_PATH = '/data/consentio-settings.json'.freeze
    COOKIES_PATH = '/data/consentio-cookies.json'.freeze
    LANGUAGE_FALLBACK = '/data/consentio-language.json'.freeze
    PACKS_DIR = 'data/i18n'.freeze

    # The loader reads the cookie in <head>, before any settings file has been fetched, so
    # these two reach the banner off the tag and are warned about in a settings file.
    TAG_ATTRIBUTES = { 'cookieName' => 'data-cookie-name', 'version' => 'data-version' }.freeze

    def self.config(site)
      site.config['consentio'] || {}
    end

    # Jekyll's relative_url filter is Liquid-only, and the generator has no Liquid context.
    def self.relative_url(site, path)
      return path.to_s unless path.to_s.start_with?('/')

      "#{site.config['baseurl'].to_s.chomp('/')}#{path}"
    end

    def self.loader_on?(config, page)
      forced = page['loader']
      return forced if forced == true || forced == false

      config['route'] != 'tag-manager'
    end

    def self.language_url(site, config)
      language = config['language'].to_s
      relative_url(site, language.empty? ? LANGUAGE_FALLBACK : language)
    end

    def self.settings(config)
      config['settings'] || {}
    end

    def self.tag_settings(settings)
      TAG_ATTRIBUTES.filter_map do |key, attribute|
        %(#{attribute}="#{settings[key]}") if settings.key?(key)
      end
    end

    # An address in the settings needs the same prefix the loader tag's URLs get. The
    # file leaves the two tag attributes out; the page global carries them, because the
    # tag route has no loader tag and reads the version from the settings.
    def self.resolved_settings(site, settings, with_tag_attributes: false)
      settings.each_with_object({}) do |(key, value), out|
        next if TAG_ATTRIBUTES.key?(key) && !with_tag_attributes

        out[key] = key.end_with?('Url') ? relative_url(site, value) : value
      end
    end

    def self.settings_json(site, settings)
      JSON.pretty_generate(resolved_settings(site, settings))
    end

    # The language file the loader tag names, read at build time. It has to exist: the
    # published packs are built into data/i18n/ before Jekyll runs.
    def self.language(site, config)
      path = config['language'].to_s
      path = LANGUAGE_FALLBACK if path.empty?
      file = File.join(site.source, path.sub(%r{\A/}, ''))
      raise "consentio: the language file #{path} is not there - run the i18n build first" unless File.exist?(file)

      JSON.parse(File.read(file))
    end

    def self.cookies(site)
      JSON.parse(File.read(File.join(site.source, COOKIES_PATH.sub(%r{\A/}, ''))))
    end

    # Inside a <script>, the one sequence that can end it early.
    def self.script_json(value)
      JSON.generate(value).gsub('</', '<\/')
    end
  end

  class ConsentioHeadTag < Liquid::Tag
    def render(context)
      site = context.registers[:site]
      config = Consentio.config(site)
      return '' unless Consentio.loader_on?(config, context.registers[:page])

      attributes = [
        %(src="#{Consentio.relative_url(site, Consentio::LOADER_SRC)}"),
        'data-consentio-loader',
        %(data-debug="#{config['debug'] ? 'true' : 'false'}"),
        %(data-settings-url="#{Consentio.relative_url(site, Consentio::SETTINGS_PATH)}"),
        %(data-language-url="#{Consentio.language_url(site, config)}"),
        %(data-cookies-url="#{Consentio.relative_url(site, Consentio::COOKIES_PATH)}")
      ] + Consentio.tag_settings(Consentio.settings(config))
      "<script #{attributes.join(' ')}></script>"
    end
  end

  # The three files as page globals, on every page, so the tag reads them at None and the
  # site has one copy of each whichever route a page runs. The loader keeps fetching.
  class ConsentioGlobalsTag < Liquid::Tag
    def render(context)
      site = context.registers[:site]
      config = Consentio.config(site)
      settings = Consentio.resolved_settings(site, Consentio.settings(config), with_tag_attributes: true)
      '<script>' \
        + "window.ConsentioSettings=#{Consentio.script_json(settings)};" \
        + "window.ConsentioLanguage=#{Consentio.script_json(Consentio.language(site, config))};" \
        + "window.ConsentioCookies=#{Consentio.script_json(Consentio.cookies(site))}" \
        + '</script>'
    end
  end

  # One row per built pack under data/i18n/, and a JSON block carrying each pack in both
  # shapes - the <locale>.json file and the <locale>.gtm.js variable - for the panel the
  # page's script opens. The argument is the shape the panel opens on: `file` or `variable`.
  class ConsentioPacksTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @shape = markup.strip == 'variable' ? 'variable' : 'file'
    end

    def render(context)
      site = context.registers[:site]
      dir = File.join(site.source, Consentio::PACKS_DIR)
      release = "#{site.config['repository_url']}/releases/latest"
      packs = Dir.glob(File.join(dir, '*.gtm.js')).sort.map do |file|
        locale = File.basename(file, '.gtm.js')
        json = File.read(File.join(dir, "#{locale}.json"))
        { 'locale' => locale, 'name' => JSON.parse(json)['name'], 'file' => json, 'variable' => File.read(file) }
      end
      rows = packs.each_with_index.map do |pack, index|
        name = CGI.escapeHTML(pack['name'])
        %(<tr class="packs__row"><td>#{name}</td><td><code>#{pack['locale']}</code></td>) \
          + %(<td><a href="#{release}">#{pack['locale']}.json</a></td>) \
          + %(<td><button type="button" class="button button--quiet packs__open" data-pack="#{index}" aria-label="Open #{name}">Open</button></td></tr>)
      end
      data = packs.to_json.gsub('</', '<\/')
      %(<table class="packs" data-shape="#{@shape}">) \
        + %(<thead><tr><th>Language</th><th>Code</th><th>On the release</th><th><span class="visually-hidden">Open</span></th></tr></thead>) \
        + %(<tbody>#{rows.join}</tbody></table>) \
        + %(<script type="application/json" id="packs-data">#{data}</script>)
    end
  end

  class ConsentioSettingsPage < PageWithoutAFile
    def initialize(site, body)
      path = Consentio::SETTINGS_PATH.sub(%r{\A/}, '')
      super(site, site.source, File.dirname(path), File.basename(path))
      self.data = { 'layout' => nil }
      self.content = body
    end
  end

  # The header and the release note name the version this site describes. package.json is the
  # one place that version is written, so the site reads it rather than carrying a copy.
  class ConsentioVersionGenerator < Generator
    safe true
    priority :highest

    def generate(site)
      package = File.expand_path('../package.json', site.source)
      site.config['docs_version'] = JSON.parse(File.read(package))['version']
    end
  end

  class ConsentioSettingsGenerator < Generator
    safe true

    def generate(site)
      settings = Consentio.config(site)['settings']
      return if settings.nil?

      site.pages << ConsentioSettingsPage.new(site, Consentio.settings_json(site, settings))
    end
  end
end

Liquid::Template.register_tag('consentio_head', Jekyll::ConsentioHeadTag)
Liquid::Template.register_tag('consentio_globals', Jekyll::ConsentioGlobalsTag)
Liquid::Template.register_tag('consentio_packs', Jekyll::ConsentioPacksTag)
