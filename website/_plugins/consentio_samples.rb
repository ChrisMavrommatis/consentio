module Jekyll
  module Consentio
    HELD_CATEGORIES = %w[preferences_functionality statistics_performance marketing_advertising].freeze
  end

  # Test equipment, off unless `consentio.sample_held_scripts` is true. Three held scripts, one
  # per category a visitor can refuse; each says on the console when it ran, so a grant can be
  # watched from the console and a script that ran too early stands out.
  class ConsentioSampleHeldScriptsTag < Liquid::Tag
    def render(context)
      config = Consentio.config(context.registers[:site])
      return '' unless config['sample_held_scripts'] == true

      Consentio::HELD_CATEGORIES.map do |category|
        %(<script type="text/plain" data-consentio="#{category}">) \
          + %(console.log('[Consentio sample] #{category} script ran');</script>)
      end.join("\n")
    end
  end
end

Liquid::Template.register_tag('consentio_sample_held_scripts', Jekyll::ConsentioSampleHeldScriptsTag)
