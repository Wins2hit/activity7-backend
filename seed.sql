INSERT INTO records (title, category, description, status) VALUES
('Broken classroom light', 'Electrical', 'The light in Room B12 does not switch on.', 'Pending'),
('Leaking tap in Lab 3', 'Plumbing', 'Water is dripping from the sink tap continuously.', 'In progress'),
('Projector not working', 'Electronics', 'The projector in Lecture Hall A shows no signal.', 'Pending'),
('Cracked window pane', 'Structural', 'Window in Room C4 has a visible crack.', 'Completed'),
('Slow Wi-Fi in library', 'Network', 'Internet speed drops significantly in the reading area.', 'In progress'),
('Air conditioner noise', 'HVAC', 'The AC unit in Room D2 makes a loud rattling sound.', 'Pending'),
('Broken door lock', 'Security', 'The lock on the main office door is jammed.', 'Pending'),
('Flickering corridor bulbs', 'Electrical', 'Corridor lights on the second floor flicker at night.', 'Completed')
ON CONFLICT DO NOTHING;