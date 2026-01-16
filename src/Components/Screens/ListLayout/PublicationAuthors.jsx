import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react'
import { deletepublicationauthor, getpublicationauthor } from '../../../API/Utils/PublicationUtils';
import { notifications } from '@mantine/notifications';
import { Button, Card, Group, Text } from '@mantine/core';

export default function PublicationAuthors() {

    const [author, setauthor] = useState([]);
    const [opened, { open, close }] = useDisclosure(false);
    const [selecteddata, setSelecteddata] = useState(null);


    const fetchpublicationauthor = async () => {
        try {
            const data = await getpublicationauthor();  
            setauthor(data)
        } catch (error) {
            cconsole.error("Error fetching Data:", err);
        }
    }

    const deleteauthor = async (id) => {
        try {
            await deletepublicationauthor(id);
            notifications.show({
                color: "red",
                title: 'Deletion Successful',
                message: `Data was removed succesfully.`,
            });
            await fetchpublicationauthor();
        } catch (error) {
            console.error("Error during deletion:", error);
            // Show error notification
            notifications.show({
                color: "red",
                title: 'Deletion Failed',
                message: 'Could not delete this author.',
            });
        }
    }

    const updateauthor = async (a) => {
        setSelecteddata(a);
        open();
    }
    const handleModalClose = async () => {
        setSelecteddata(null);
        close();
    }


    useEffect(() => {
        fetchpublicationauthor()
    }, [])


    return (
        <>
            {/* <Button onClick={() => open()}>
                Add new Barangay
            </Button> */}

            {author.map((authordata) => (
                <Card withBorder padding="lg" radius="md" key={authordata.author_id}>
                    <Text fz="lg" fw={500} mt="md">
                        {authordata.author_name}
                    </Text>
                    <Group justify="space-between" mt="md">
                        <Button>
                            Click me
                        </Button>
                    </Group>
                </Card>
            ))}
        </>
    )
}
