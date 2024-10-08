import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Task, TaskFormData } from '../../types';
import TaskForm from './TaskForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editTask } from '../../services/taskApi';
import { toast } from 'react-toastify';

type EditTaskModalProp = {
    task:Task
}

export default function EditTaskModal({task}: EditTaskModalProp) {

    const navigate = useNavigate()
    const {register, handleSubmit, formState:{errors} } = useForm<TaskFormData>({defaultValues:{
        name: task.name,
        description: task.description
    }});

    const projectId = useParams().projectId!
    const queryClient = useQueryClient()
    const {mutate} = useMutation({
        mutationFn: editTask,
        onError:(err)=>{
            queryClient.invalidateQueries({queryKey:['task', task._id]})
            queryClient.invalidateQueries({queryKey:['details', projectId]})
            toast.error(err.message)
            navigate(location.pathname)
        },
        onSuccess:(data)=>{
            queryClient.invalidateQueries({queryKey:['task', task._id]})
            queryClient.invalidateQueries({queryKey:['details', projectId]})
            toast.success(data)
            navigate(location.pathname)
        }
    })

    const handleEditTask: SubmitHandler<TaskFormData> = (formData)=>{
        mutate({projectId, taskId: task._id, taskFormData:formData})
    }


    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => {navigate(location.pathname)} }>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all p-16">
                                <Dialog.Title
                                    as="h3"
                                    className="font-black text-4xl  my-5"
                                >
                                    Editar Tarea
                                </Dialog.Title>

                                <p className="text-xl font-bold">Realiza cambios a una tarea en {''}
                                    <span className="text-fuchsia-600">este formulario</span>
                                </p>

                                <form
                                    className="mt-10 space-y-3"
                                    onSubmit={handleSubmit(handleEditTask)}
                                    noValidate
                                >
                    
                                    <TaskForm register={register} errors={errors}/>
                    
                                    <input
                                        type="submit"
                                        className=" bg-fuchsia-600 hover:bg-fuchsia-700 w-full p-3  text-white font-black  text-xl cursor-pointer"
                                        value='Guardar Tarea'
                                    />
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}