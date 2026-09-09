require 'json'

module Jekyll
  module Consentio
    LOADER_SRC = '/js/consentio-loader.min.js'.freeze
    SETTINGS_PATH = '/data/consentio-settings.json'.freeze
    COOKIES_PATH = '/data/consentio-cookies.json'.freeze
    LANGUAGE_FALLBACK = '/data/consentio-language.json'.freeze

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

    # The settings file is fetched by the page, so an address in it needs the same prefix
    # the loader tag's URLs get.
    def self.settings_json(site, settings)
      resolved = settings.each_with_object({}) do |(key, value), out|
        next if TAG_ATTRIBUTES.key?(key)

        out[key] = key.end_with?('Url') ? relative_url(site, value) : value
      end
      JSON.pretty_generate(resolved)
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

  class ConsentioSettingsPage < PageWithoutAFile
    def initialize(site, body)
      path = Consentio::SETTINGS_PATH.sub(%r{\A/}, '')
      super(site, site.source, File.dirname(path), File.basename(path))
      self.data = { 'layout' => nil }
      self.content = body
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
