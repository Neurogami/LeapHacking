#!/usr/bin/env ruby
#
Thread.abort_on_exception = true

require 'em-websocket'
require "readline"
require 'json'

@port = ARGV.empty? ? 8090 : ARGV.shift.to_i

# Helper method for knowing when to exit
def quit? m
  m.strip!
  m =~ /^q$/
end


# Define the channel here so we can refer to it later in diffent settings
@channel = nil

def input_to_json s

  # Hack; assume it is already json if it is wrapped in curly braces.
  return s if s =~ /^{(.+)}$/

  # Assume for now that inut takes a known format:
  # command <arg arg arg ...>
  # So, split on space
  parts = s.split(' ').map{ |_| _.strip }
  h = {}
  h['command'] = parts.shift

  if !parts.empty?
    h['args'] = parts
  end

  h.to_json

end

# Set up a thread to give us a CLI for sending messages to all listeners
# Use a short delay so that @channel can be reassigned to be an actual channel
# then loop and handle user input
t = Thread.new do
  sleep 5
  quit = nil 

  while buf = Readline.readline( "> ", !quit)
    print "-] ", buf, "\n"
    puts buf  
    message = buf.to_s.strip
    if quit? message
      puts "Received the 'quit' command.  See you later!"
      exit
    else
      unless message.empty?
        warn "Push new message onto channel..."
        json = input_to_json message
        warn json
        @channel.push json
        puts 'OK'
      else
        warn "No message to send"
      end
    end
  end

end

@sid = nil

# Start our Web socket server that sends out the channel messages
EventMachine.run {
  @channel = EM::Channel.new

  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => @port, :debug => true) do |ws|

    ws.onopen {
      warn "WS open!"
      @sid = @channel.subscribe { |msg| ws.send msg }
      @channel.push "#{@sid} connected!".to_json
    }

    ws.onmessage { |msg|
      warn "WS message!"
      @channel.push "<#{@sid}>: #{msg}".to_json
    }

    ws.onclose {
      warn "WS close!"
      @channel.unsubscribe @sid
    }

  end

  puts "Server started"
}

