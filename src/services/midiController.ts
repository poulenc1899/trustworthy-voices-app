/// <reference types="webmidi" />

interface CCMapping {
  [key: string]: number | null
}

interface NoteMapping {
  note: number | null
  channel: number
}

type CCChangeCallback = ((slider: string, value: number) => void) | null
type NoteCallback = (() => void) | null

class MidiController {
  private midiAccess: WebMidi.MIDIAccess | null = null
  private selectedDevice: WebMidi.MIDIInput | null = null
  private ccMappings: CCMapping = {
    voicePitch: null,
    pitchVariation: null,
    breathiness: null,
    speed: null,
  }
  private noteMapping: NoteMapping = {
    note: null,
    channel: 0
  }
  private onCCChange: CCChangeCallback = null
  private onNoteTrigger: NoteCallback = null

  async initialize() {
    try {
      this.midiAccess = await navigator.requestMIDIAccess()
      console.log('MIDI access granted')
    } catch (error) {
      console.error('MIDI access error:', error)
    }
  }

  getDevices(): WebMidi.MIDIInput[] {
    if (!this.midiAccess) return []
    return Array.from(this.midiAccess.inputs.values())
  }

  selectDevice(deviceId: string | null) {
    if (this.selectedDevice) {
      this.selectedDevice.onmidimessage = null
    }

    if (!deviceId || !this.midiAccess) {
      this.selectedDevice = null
      return
    }

    const device = this.midiAccess.inputs.get(deviceId)
    if (device) {
      this.selectedDevice = device
      this.setupMessageHandler()
    }
  }

  setCCMappings(mappings: CCMapping) {
    this.ccMappings = mappings
  }

  setNoteMapping(mapping: NoteMapping) {
    this.noteMapping = mapping
  }

  setOnCCChange(callback: CCChangeCallback) {
    this.onCCChange = callback
  }

  setOnNoteTrigger(callback: NoteCallback) {
    this.onNoteTrigger = callback
  }

  private setupMessageHandler() {
    if (!this.selectedDevice) return

    this.selectedDevice.onmidimessage = (event: WebMidi.MIDIMessageEvent) => {
      const [status, data1, data2] = event.data

      // Handle CC messages
      if (status >= 0xB0 && status <= 0xBF) {
        const ccNumber = data1
        const value = data2 / 127 // Normalize to 0-1

        // Find which slider this CC is mapped to
        const mappedSlider = Object.entries(this.ccMappings).find(([, mappedCC]) => mappedCC === ccNumber)?.[0]
        if (mappedSlider && this.onCCChange) {
          this.onCCChange(mappedSlider, value)
        }
      }

      // Handle Note On messages
      if (status >= 0x90 && status <= 0x9F) {
        const channel = status - 0x90
        const note = data1
        const velocity = data2

        if (channel === this.noteMapping.channel && 
            note === this.noteMapping.note && 
            velocity > 0 && 
            this.onNoteTrigger) {
          this.onNoteTrigger()
        }
      }
    }
  }
}

export const midiController = new MidiController() 