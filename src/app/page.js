'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Button, 
  Group, 
  Stack, 
  ColorSwatch,
  Box
} from '@mantine/core';

// Color Configurations
const COLOR_CONFIGS = {
  foreground: [
    { code: 30, name: "Dark Gray", color: "#4f545c" },
    { code: 31, name: "Red", color: "#dc322f" },
    { code: 32, name: "Yellowish Green", color: "#859900" },
    { code: 33, name: "Gold", color: "#b58900" },
    { code: 34, name: "Light Blue", color: "#268bd2" },
    { code: 35, name: "Pink", color: "#d33682" },
    { code: 36, name: "Teal", color: "#2aa198" },
    { code: 37, name: "White", color: "#ffffff" }
  ],
  background: [
    { code: 40, name: "Blueish Black", color: "#002b36" },
    { code: 41, name: "Rust Brown", color: "#cb4b16" },
    { code: 42, name: "Gray (40%)", color: "#586e75" },
    { code: 43, name: "Gray (45%)", color: "#657b83" },
    { code: 44, name: "Light Gray (55%)", color: "#839496" },
    { code: 45, name: "Blurple", color: "#6c71c4" },
    { code: 46, name: "Light Gray (60%)", color: "#93a1a1" },
    { code: 47, name: "Cream White", color: "#fdf6e3" }
  ]
};

export default function Home() {
  const [text, setText] = useState("Welcome to Rebane's Discord Colored Text Generator!");
  const [copiedStatus, setCopiedStatus] = useState("Copy Discord Formatted Text");
  const textAreaRef = useRef(null);
  const savedSelectionRef = useRef(null);

  // Function to save the current text selection
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0);
    }
  };

  // Function to restore the saved selection
  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }
  };

  const applyStyle = (styleCode) => {
    // Restore the previously saved selection
    restoreSelection();

    const selection = window.getSelection();
    
    // If no selection, exit
    if (!savedSelectionRef.current || selection.toString().length === 0) {
      alert("Please select some text first!");
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    // Create a span to wrap the selected text
    const span = document.createElement('span');
    
    // Apply different styling based on the code range
    if (styleCode === 1) {
      // Bold
      span.style.fontWeight = 'bold';
      span.className = `ansi-${styleCode}`;
    } else if (styleCode === 4) {
      // Underline
      span.style.textDecoration = 'underline';
      span.className = `ansi-${styleCode}`;
    } else if (styleCode >= 30 && styleCode < 40) {
      // Foreground color
      span.style.color = COLOR_CONFIGS.foreground.find(c => c.code === styleCode)?.color || '';
      span.className = `ansi-${styleCode}`;
    } else if (styleCode >= 40 && styleCode < 48) {
      // Background color
      span.style.backgroundColor = COLOR_CONFIGS.background.find(c => c.code === styleCode)?.color || '';
      span.className = `ansi-${styleCode}`;
    }

    // Replace the selected content
    range.deleteContents();
    span.textContent = selectedText;
    range.insertNode(span);

    // Update the text in the state
    setText(textAreaRef.current.innerHTML);

    // Save the new selection
    saveSelection();
  };

  // Add event listener to save selection when text is selected
  useEffect(() => {
    const handleSelection = () => {
      saveSelection();
    };

    const editor = textAreaRef.current;
    if (editor) {
      editor.addEventListener('mouseup', handleSelection);
      return () => {
        editor.removeEventListener('mouseup', handleSelection);
      };
    }
  }, []);

  const copyToClipboard = () => {
    const formattedText = "```ansi\n" + convertToANSI(textAreaRef.current.childNodes) + "\n```";
    
    navigator.clipboard.writeText(formattedText).then(() => {
      setCopiedStatus("Copied!");
      setTimeout(() => setCopiedStatus("Copy Discord Formatted Text"), 2000);
    });
  };

  const convertToANSI = (nodes, states = [{ fg: 37, bg: 40, st: 0 }]) => {
    let text = "";
    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeName === "BR") {
        text += "\n";
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const ansiCode = parseInt(node.className.split('-')[1]);
        const newState = { ...states[states.length - 1] };

        if (ansiCode < 30) newState.st = ansiCode;
        if (ansiCode >= 30 && ansiCode < 40) newState.fg = ansiCode;
        if (ansiCode >= 40) newState.bg = ansiCode;

        states.push(newState);
        text += `\x1b[${newState.st};${ansiCode >= 40 ? newState.bg : newState.fg}m`;
        text += convertToANSI(node.childNodes, states);
        states.pop();
        text += "\x1b[0m";
      }
    });
    return text;
  };

  return (
    <Container size="sm" py="xl">
      <Title order={1} ta="center" mb="xl">
        Rebane&apos;s Discord <Text span c="blue">Colored</Text> Text Generator
      </Title>

      <Paper shadow="md" p="lg" radius="md">
        <Stack spacing="md">
          {/* Style Buttons */}
          <Group position="center">
            <Button 
              variant="subtle" 
              color="gray" 
              onClick={() => applyStyle(1)}
            >
              <b>B</b>
            </Button>
            <Button 
              variant="subtle" 
              color="gray" 
              onClick={() => applyStyle(4)}
            >
              <u>U</u>
            </Button>
          </Group>

          {/* Foreground Colors */}
          <Box>
            <Text fw={500} mb="xs">Foreground Colors:</Text>
            <Group>
              {COLOR_CONFIGS.foreground.map((color) => (
                <ColorSwatch 
                  key={color.code}
                  color={color.color} 
                  onClick={() => applyStyle(color.code)}
                />
              ))}
            </Group>
          </Box>

          {/* Background Colors */}
          <Box>
            <Text fw={500} mb="xs">Background Colors:</Text>
            <Group>
              {COLOR_CONFIGS.background.map((color) => (
                <ColorSwatch 
                  key={color.code}
                  color={color.color} 
                  onClick={() => applyStyle(color.code)}
                />
              ))}
            </Group>
          </Box>

          {/* Editable Text Area */}
          <div 
            ref={textAreaRef}
            contentEditable 
            style={{
              border: '1px solid #ccc',
              minHeight: '200px',
              padding: '10px',
              backgroundColor: '#f4f4f4'
            }}
            dangerouslySetInnerHTML={{ __html: text }}
          />

          {/* Copy Button */}
          <Button fullWidth onClick={copyToClipboard}>
            {copiedStatus}
          </Button>
        </Stack>
      </Paper>

    </Container>
  );
}