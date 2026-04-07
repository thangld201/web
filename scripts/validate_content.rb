#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"
require "date"

ROOT = File.expand_path("..", __dir__)

def load_yaml(path)
  YAML.safe_load(File.read(path), permitted_classes: [Date], aliases: true)
rescue Psych::Exception => e
  abort "YAML parse error in #{path}: #{e.message}"
end

def blank?(value)
  value.nil? || (value.respond_to?(:strip) && value.strip.empty?)
end

def looks_like_url?(value)
  value.to_s.match?(%r{\Ahttps?://}i) || value.to_s.match?(%r{\Amailto:}i)
end

errors = []

leader_path = File.join(ROOT, "_data", "leader.yml")
leader = load_yaml(leader_path)
if !leader.is_a?(Hash)
  errors << "_data/leader.yml must define a map/object."
else
  %w[name title photo email].each do |field|
    errors << "_data/leader.yml #{field} is required." if blank?(leader[field])
  end

  unless blank?(leader["photo"])
    leader_photo = File.join(ROOT, "images", leader["photo"])
    errors << "_data/leader.yml photo points to a missing file: images/#{leader['photo']}" unless File.exist?(leader_photo)
  end

  unless blank?(leader["email"])
    errors << "_data/leader.yml email must be a plain email address (no mailto:)." unless leader["email"].to_s.match?(/\A[^@\s]+@[^@\s]+\.[^@\s]+\z/)
  end

  %w[twitter scholar].each do |field|
    value = leader[field]
    next if blank?(value) || value == "#"
    errors << "_data/leader.yml #{field} must be a valid URL." unless looks_like_url?(value)
  end

  %w[bio interests education awards].each do |field|
    value = leader[field]
    errors << "_data/leader.yml #{field} must be a non-empty list." unless value.is_a?(Array) && !value.empty?
  end
end

team_path = File.join(ROOT, "_data", "team.yml")
team_data = load_yaml(team_path)
members = team_data.is_a?(Hash) ? team_data["members"] : nil
if !members.is_a?(Array) || members.empty?
  errors << "_data/team.yml must define a non-empty 'members' list."
else
  members.each_with_index do |member, idx|
    base = "_data/team.yml members[#{idx}]"
    %w[name role photo email].each do |field|
      value = member[field]
      errors << "#{base}.#{field} is required." if blank?(value)
    end

    photo = member["photo"]
    unless blank?(photo)
      photo_file = File.join(ROOT, "images", photo)
      errors << "#{base}.photo points to a missing file: images/#{photo}" unless File.exist?(photo_file)
    end

    email = member["email"]
    if !blank?(email) && !looks_like_url?(email)
      errors << "#{base}.email must be a valid mailto:/http(s) URL."
    end

    %w[linkedin website scholar twitter github].each do |field|
      value = member[field]
      next if blank?(value) || value == "#"
      next if !field.eql?("website") && looks_like_url?(value)
      next if field.eql?("website") && (looks_like_url?(value) || value.match?(%r{\A[a-z0-9/_-]+\z}i))

      errors << "#{base}.#{field} must be a valid URL (or '#' for blank)."
    end
  end
end

news_path = File.join(ROOT, "_data", "news.yml")
news_data = load_yaml(news_path)
news_items = news_data.is_a?(Hash) ? news_data["news"] : nil
if !news_items.is_a?(Array) || news_items.empty?
  errors << "_data/news.yml must define a non-empty 'news' list."
else
  news_items.each_with_index do |item, idx|
    base = "_data/news.yml news[#{idx}]"
    %w[title date content].each do |field|
      errors << "#{base}.#{field} is required." if blank?(item[field])
    end
    next if blank?(item["date"])

    begin
      Date.iso8601(item["date"].to_s)
    rescue ArgumentError
      errors << "#{base}.date must be in YYYY-MM-DD format."
    end
  end
end

pubs_path = File.join(ROOT, "_data", "publications.yml")
pubs_data = load_yaml(pubs_path)
publications = pubs_data.is_a?(Hash) ? pubs_data["publications"] : nil
allowed_types = %w[conference journal workshop preprint]
if !publications.is_a?(Array) || publications.empty?
  errors << "_data/publications.yml must define a non-empty 'publications' list."
else
  publications.each_with_index do |pub, idx|
    base = "_data/publications.yml publications[#{idx}]"
    %w[title authors venue year type badge].each do |field|
      errors << "#{base}.#{field} is required." if blank?(pub[field])
    end

    year = pub["year"]
    if !blank?(year) && !(year.is_a?(Integer) || year.to_s.match?(/\A\d{4}\z/))
      errors << "#{base}.year must be a 4-digit year."
    end

    type = pub["type"].to_s
    if !blank?(type) && !allowed_types.include?(type)
      errors << "#{base}.type must be one of: #{allowed_types.join(', ')}."
    end

    links = pub["links"]
    if links && !links.is_a?(Hash)
      errors << "#{base}.links must be an object/map."
    elsif links.is_a?(Hash)
      links.each do |name, value|
        next if blank?(value) || value == "#"
        errors << "#{base}.links.#{name} must be a valid URL." unless looks_like_url?(value.to_s)
      end
    end
  end
end

if errors.empty?
  puts "Content validation passed."
else
  puts "Content validation failed:"
  errors.each { |e| puts "- #{e}" }
  exit 1
end
