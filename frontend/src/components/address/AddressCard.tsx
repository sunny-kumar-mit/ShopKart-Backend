import { Address } from '@/types/address';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressCardProps {
    address: Address;
    onEdit: (address: Address) => void;
    onDelete: (id: string) => void;
    onSetDefault: (id: string) => void;
}

export const AddressCard = ({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) => {
    return (
        <Card className={cn("relative", address.isDefault ? "border-primary border-2" : "")}>
            {address.isDefault && (
                <div className="absolute -top-3 left-4">
                    <Badge className="bg-primary hover:bg-primary">Default</Badge>
                </div>
            )}
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-semibold text-lg flex items-center gap-2">
                            {address.fullName}
                            <Badge variant="outline" className="text-xs font-normal">
                                {address.addressType}
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {address.phone} {address.altPhone && `, ${address.altPhone}`}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="text-sm">
                <p>{address.addressLine1}</p>
                <p>{address.addressLine2}</p>
                {address.landmark && <p className="text-muted-foreground text-xs mt-1">Landmark: {address.landmark}</p>}
                <p>{address.city}, {address.state} - <span className="font-medium">{address.pincode}</span></p>
            </CardContent>
            <CardFooter className="flex justify-between pt-0 border-t p-4 bg-muted/20">
                {!address.isDefault && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 px-2"
                        onClick={() => onSetDefault(address._id)}
                    >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Set as Default
                    </Button>
                )}
                <div className="flex gap-2 ml-auto">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(address)}>
                        <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(address._id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
