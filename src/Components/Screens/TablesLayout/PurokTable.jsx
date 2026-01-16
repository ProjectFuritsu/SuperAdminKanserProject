import { useDisclosure } from '@mantine/hooks';
import React, { useEffect, useState } from 'react'
import { getpurok, deletepurok } from '../../../API/Utils/HealthInstiUtils';
import { notifications } from '@mantine/notifications';
import { ActionIcon, Button, Center, Loader, Menu, Pagination, Table } from '@mantine/core';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import PurokModal from '../../UI/Modals/PurokModal';


const PAGE_SIZE = 8;
export default function PurokTable() {


    const [purok, setpurok] = useState([]);
    const [activePage, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [opened, { open, close }] = useDisclosure(false);
    const [selecteddata, setSelecteddata] = useState(null);


    const fetchpuroks = async () => {
        setLoading(true);
        try {
            const from = (activePage - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            // Ensure your utility returns { data, count }
            const result = await getpurok(from, to);

            setpurok(result.data || []);
            setTotalCount(result.count || 0);
        } catch (error) {
            console.error("Error fetching Data:", error);
        } finally {
            setLoading(false);
        }
    }



    const deletepuroks = async (id) => {
        try {
            await deletepurok(id);
            notifications.show({
                color: "red",
                title: 'Deletion Successful',
                message: `brgy Code ${id} was deleted.`,
            });
            await fetchpuroks();
        } catch (error) {
            console.error("Error during deletion:", error);
            // Show error notification
            notifications.show({
                color: "red",
                title: 'Deletion Failed',
                message: 'Could not delete this province.',
            });
        }
    }

    const handleModalClose = () => {
        setSelecteddata(null);
        close()
    }

    const updatepuroks = async (prk) => {
        setSelecteddata(prk);
        open();
    }

    // Trigger fetch every time activePage changes
    useEffect(() => {
        fetchpuroks();
    }, [activePage]);


    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return (
        <>
            <PurokModal data={selecteddata} onClose={handleModalClose} onSuccess={fetchpuroks} opened={opened} />
            <Button onClick={() => open()} mb="md">
                Add new Purok
            </Button>

            <Table verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Code</Table.Th>
                        <Table.Th>Purok name</Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {loading ? (
                        <Table.Tr><Table.Td colSpan={3}><Center><Loader size="sm" /></Center></Table.Td></Table.Tr>
                    ) : (
                        purok.map((item) => (
                            <Table.Tr key={item.purok_code}>
                                <Table.Td>{item.purok_code}</Table.Td>
                                <Table.Td>{item.purok_name}</Table.Td>
                                <Table.Td>
                                    <Menu withinPortal position="bottom-end" shadow="sm">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDots size={16} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => updatepuroks(item)}>
                                                Edit Entry
                                            </Menu.Item>
                                            <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => deletepuroks(item.purok_code)}>
                                                Delete Entry
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Table.Td>
                            </Table.Tr>

                        ))
                    )}
                </Table.Tbody>
            </Table>

            {/* THE PAGINATION CONTROL */}
            <Center mt="xl">
                <Pagination
                    total={totalPages > 0 ? totalPages : 1}
                    value={activePage}
                    onChange={setPage}
                    withEdges // Adds "First" and "Last" buttons for better UX
                />
            </Center>
        </>
    )
}
