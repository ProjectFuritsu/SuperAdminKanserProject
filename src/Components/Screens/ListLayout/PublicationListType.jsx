import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react'
import { PubtypeModal } from '../../indexUI';
import { ActionIcon, Button, Card, Menu, Text } from '@mantine/core';
import { deletePublicationType, publicationTypes } from '../../../API/Utils/PublicationUtils';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export default function PublicationListType() {
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedType, setSelectedType] = useState(null);
    const [pubTypes, setPubTypes] = useState([]);
    
    const fetchTypes = async () => {
        try {
            // 1. Call your API function
            // Replace 'publicationTypes' with your actual API call function
            const data = await publicationTypes();

            // 2. Update state with the fetched array
            setPubTypes(data);

        } catch (err) {
            console.error("Error fetching publication types:", err);
        }
    };

    const handleEdit = (pubType) => {
        setSelectedType(pubType); // Set the data to be edited
        open();
    };

    const handleAdd = () => {
        setSelectedType(null); // Ensure modal is in 'Add' mode
        open();
    }

    const handleModalClose = () => {
        setSelectedType(null);
        close();
    }

    const handleDelete = async (id) => {
        try {
            await deletePublicationType(id);
            await fetchTypes();
            notifications.show({
                color: "red",
                title: 'Deletion Successful',
                message: `Publication Type ID ${id} was deleted.`,
            });
        } catch (error) {
            console.error("Error during deletion:", error);
            // Show error notification
            notifications.show({
                color: "red",
                title: 'Deletion Failed',
                message: 'Could not delete the publication type.',
            });
        }
    }

    useEffect(() => {
        fetchTypes();
        // Empty dependency array ensures it runs ONLY once on mount
    }, []);
    
    return (
        <>
            {/* 1. The reusable Modal component */}
            <PubtypeModal
                opened={opened}
                onClose={handleModalClose}
                data={selectedType} // Null for add, object for edit
                onSuccess={fetchTypes} // Triggers list refresh after add/edit
            />

            {/* The ADD button (now using the handleAdd function) */}
            <Button variant="default" onClick={handleAdd}>
                Add Publication Type
            </Button>

            {/* 2. Mapping through publication types */}
            {pubTypes.map((ptype) => (
                <Card
                    key={ptype.publication_type_code} shadow="sm" padding="lg" radius="md" withBorder
                >
                    <Card.Section>
                        <Text >{ptype.type_description}</Text>
                    </Card.Section>
                    <Card.Section>
                        <Menu withinPortal position="bottom-end" shadow="sm">
                            <Menu.Target>
                                <ActionIcon variant="subtle" color="gray">
                                    <IconDots size={16} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconEdit size={14} />}
                                    onClick={() => handleEdit(ptype)} // Calls handleEdit with ptype data
                                >
                                    Edit Entry
                                </Menu.Item>

                                <Menu.Item
                                    leftSection={<IconTrash size={14} />}
                                    color="red"
                                    onClick={() => handleDelete(ptype.publication_type_code)}
                                >
                                    Delete Entry
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Card.Section>
                </Card>
            ))}
        </>
    );
}
