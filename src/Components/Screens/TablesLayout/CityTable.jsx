import { useDisclosure } from '@mantine/hooks';
import React, { useEffect, useState } from 'react'
import { deletecity, getcity } from '../../../API/Utils/HealthInstiUtils';
import { ActionIcon, Button, Center, Loader, Menu, Pagination, Table } from '@mantine/core';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import CityModal from '../../UI/Modals/CityModal';
import { notifications } from '@mantine/notifications';


const PAGE_SIZE = 11;


export default function CityTable() {

    const [city, setcity] = useState([]);

    const [opened, { open, close }] = useDisclosure(false);
    const [selecteddata, setSelecteddata] = useState(null);
    const [activePage, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);


    const fetchcity = async () => {
        setLoading(true);
        try {
            const from = (activePage - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            const data = await getcity(from, to);
            setcity(data.data || [])
            setTotalCount(data.count || 0);
        } catch (error) {
            console.error("Error fetching Data:", error);
        } finally {
            setLoading(false);
        }
    }


    const deletecities = async (id) => {
        try {
            await deletecity(id);
            notifications.show({
                color: "red",
                title: 'Deletion Successful',
                message: `City Code ${id} was deleted.`,
            });
            await fetchcity();
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

    const updatecity = async (city) => {
        setSelecteddata(city);
        open();
    }
    const handleModalClose = async () => {
        setSelecteddata(null);
        close();
    }

    useEffect(() => {
        fetchcity()
    }, [activePage])



    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return (
        <>
            <CityModal data={selecteddata} onClose={handleModalClose} onSuccess={fetchcity} opened={opened} />

            <Button onClick={() => open()}>
                Add new City
            </Button>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Code</Table.Th>
                        <Table.Th>Province name</Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {loading ? (
                        <Table.Tr><Table.Td colSpan={3}><Center><Loader size="sm" /></Center></Table.Td></Table.Tr>
                    ) : (
                        city.map((city) => {
                            return (
                                <Table.Tr key={city.city_zip_code}>
                                    <Table.Td>{city.city_zip_code}</Table.Td>
                                    <Table.Td>{city.city_name}</Table.Td>
                                    <Table.Td>
                                        <Menu withinPortal position="bottom-end" shadow="sm">
                                            <Menu.Target>
                                                <ActionIcon variant="subtle" color="gray">
                                                    <IconDots size={16} />
                                                </ActionIcon>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Item
                                                    leftSection={<IconEdit size={14} />}
                                                    onClick={() => updatecity(city)}
                                                >
                                                    Edit Entry
                                                </Menu.Item>

                                                <Menu.Item
                                                    leftSection={<IconTrash size={14} />}
                                                    color="red"
                                                    onClick={() => deletecities(city.city_zip_code)}
                                                >
                                                    Delete Entry
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    </Table.Td>
                                </Table.Tr>
                            )
                        }))}
                </Table.Tbody>
            </Table >
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
