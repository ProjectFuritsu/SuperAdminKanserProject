import { useState, useEffect } from 'react';
import { Modal, Button, Group, Stack, Text, Flex } from '@mantine/core';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconCode } from '@tabler/icons-react'; // Changed icon for source toggle
import { updateHealthInstiDescripiton } from '../../../API/healthInstiAPI';
import { updateFinancialInstiDescription } from '../../../API/financialInstiAPI';

export default function DescriptionModal({
    opened,
    onClose,
    onSave,
    instiId,
    initialDescription,
    mode
}) {
    const [loading, setLoading] = useState(false);
    const [isSourceCodeModeActive, setIsSourceCodeModeActive] = useState(false);

    // 1. Initialize the Tiptap Editor
    const editor = useEditor({
        extensions: [
            StarterKit
        ],
        // This will put the cursor at the end of the content on load
        autofocus: 'end',
        content: initialDescription || '',
        immediatelyRender: false,
    });

    // 2. Sync editor content when modal opens or initialDescription changes
    useEffect(() => {
        if (opened && editor) {
            editor.commands.setContent(initialDescription || '');
        }
    }, [opened, initialDescription, editor]);

    // 3. Handle Save Logic
    const handleSubmit = async () => {
        if (!editor) return;

        setLoading(true);
        const htmlContent = editor.getHTML();

        try {
            let response;

            if (mode === 'health') {
                // Health Payload
                response = await updateHealthInstiDescripiton(instiId, {
                    hospitals_desc_content: htmlContent
                });
            } else {
                // Financial Payload
                response = await updateFinancialInstiDescription(instiId, {
                    financial_insti_desc: htmlContent
                });
            }

            // Update parent state with the response from the DB
            onSave(response);

            notifications.show({
                title: 'Success',
                message: 'Description updated successfully',
                color: 'green',
                icon: <IconCheck size={16} />,
            });

            onClose();
        } catch (error) {
            console.error("Description Update Error:", error);
            notifications.show({
                title: 'Error',
                message: 'Failed to update database. Please try again.',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Edit ${mode === 'health' ? 'Health' : 'Financial'} Institution Description`}
            size="xl"
            centered
        >
            <Stack gap="md">
                <Flex direction="column" gap="sm">
                    <Text fw={500} size="sm" c="dimmed">
                        {isSourceCodeModeActive ? 'Viewing Raw HTML' : 'Visual Editor'}
                    </Text>

                    <RichTextEditor editor={editor}>
                        <RichTextEditor.Toolbar>
                            {!isSourceCodeModeActive && (
                                <>
                                    <RichTextEditor.ControlsGroup>
                                        <RichTextEditor.Bold />
                                        <RichTextEditor.Italic />
                                        <RichTextEditor.Underline />
                                        <RichTextEditor.Strikethrough />
                                        <RichTextEditor.ClearFormatting />
                                        <RichTextEditor.Highlight />
                                        <RichTextEditor.BulletList />
                                        <RichTextEditor.OrderedList />
                                    </RichTextEditor.ControlsGroup>

                                    <RichTextEditor.ControlsGroup>
                                        <RichTextEditor.H1 />
                                        <RichTextEditor.H2 />
                                        <RichTextEditor.H3 />
                                    </RichTextEditor.ControlsGroup>

                                    <RichTextEditor.ControlsGroup>
                                        <RichTextEditor.Blockquote />
                                        <RichTextEditor.Link />
                                    </RichTextEditor.ControlsGroup>
                                </>
                            )}
                        </RichTextEditor.Toolbar>

                        <RichTextEditor.Content
                            style={{
                                minHeight: 300,
                                maxHeight: 500,
                                overflowY: 'auto'
                            }}
                        />
                    </RichTextEditor>
                </Flex>

                <Group justify="flex-end">
                    <Button variant="subtle" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        loading={loading}
                        color={mode === 'health' ? 'blue' : 'teal'}
                    >
                        Save Description
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}