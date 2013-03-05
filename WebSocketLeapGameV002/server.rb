#!/usr/bin/env ruby

require 'webrick'

include WEBrick

RUBY_PLATFORM =~ /mingw|mswin32/ ?   ( signal = 'INT'; kickoff = 'start' ) :  ( signal = "INT"; kickoff = 'ch' )

PORT = 8337 

s = HTTPServer.new :Port => PORT 

s.mount "/", WEBrick::HTTPServlet::FileHandler, Dir::pwd, true  
s.mount_proc('/quit') { |req, resp| s.shutdown;  exit;  }  

Thread.new {
	sleep 5 
  c = "#{kickoff} http://127.0.0.1:#{PORT}"
   warn c
	warn `#{c}`
}
trap( signal ){ s.shutdown }
s.start





